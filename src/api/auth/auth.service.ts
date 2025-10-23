import { accountService } from "@/api/account/account.service";
import { mailService } from "@/api/mail/mail.service";
import { BcryptHelper } from "@/common/utils/brcypt";
import type {
  CreateAccount,
  Login,
  ForgotPassword,
  ChangePassword,
  ResendOtp,
  VerifyEmail,
  ResetPassword,
} from "@/api/auth/auth.dto";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";
import type { Account } from "@/generated/prisma";
import { JwtHelper, TokenPair } from "@/common/utils/jwt";

export class AuthService {
  private OTP_EXPIRY_HOURS = 24;

  private generateOtpCode(): string {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  private getOtpExpiry(): Date {
    return new Date(Date.now() + this.OTP_EXPIRY_HOURS * 60 * 60 * 1000);
  }

  async register(payload: CreateAccount) {
    try {
      const existing = await accountService.accountRepository.findByEmail(
        payload.email
      );
      if (existing)
        return ServiceResponse.failure(
          `Account with email ${payload.email} already exists`,
          null,
          StatusCodes.BAD_REQUEST
        );

      const hashed = await BcryptHelper.hash(payload.password);
      const otp = this.generateOtpCode();

      const newAccount = await accountService.accountRepository.create({
        data: {
          ...payload,
          password: hashed,
          otp,
          otp_expires_at: this.getOtpExpiry(),
        },
      });

      await mailService.sendMail({
        to: newAccount.email,
        subject: "Verify Your Email",
        text: `Your OTP code is ${otp}. It expires in ${this.OTP_EXPIRY_HOURS} hours.`,
      });

      const {
        password,
        otp: processedOtp,
        otp_expires_at,
        ...rest
      } = newAccount;

      return ServiceResponse.success<
        Omit<Account, "password" | "otp" | "otp_expires_at">
      >(
        "Successfully created account. Check your email for the verification code.",
        rest
      );
    } catch (error) {
      logger.error(`Error registering account: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while signing up user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyEmail(payload: VerifyEmail) {
    try {
      const account = await accountService.accountRepository.findByOtp(
        payload.otp
      );

      if (!account)
        return ServiceResponse.failure(
          "Invalid OTP",
          null,
          StatusCodes.BAD_REQUEST
        );

      if (!account.otp_expires_at || account.otp_expires_at < new Date())
        return ServiceResponse.failure(
          "OTP expired. Please request another.",
          null,
          StatusCodes.BAD_REQUEST
        );

      await Promise.all([
        accountService.accountRepository.update({
          where: { email: account.email },
          data: { is_email_verified: true, otp: null, otp_expires_at: null },
        }),
        mailService.sendMail({
          to: account.email,
          subject: "Email Verified",
          text: "Your email has been successfully verified. You can now log in.",
        }),
      ]);

      return ServiceResponse.success<boolean>(
        "Successfully verified account",
        true
      );
    } catch (error) {
      logger.error(`Error verifying email: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while verifying email",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async login(payload: Login) {
    try {
      let account = await accountService.accountRepository.findByEmail(
        payload.email
      );
      if (!account)
        return ServiceResponse.failure(
          "Invalid email or password",
          null,
          StatusCodes.BAD_REQUEST
        );

      console.log("[account]", account);

      // if (!account.is_email_verified)
      //   return ServiceResponse.failure(
      //     "Please verify your email before logging in.",
      //     null,
      //     StatusCodes.FORBIDDEN
      //   );

      const isValid = await BcryptHelper.compare(
        payload.password,
        account.password!
      );
      if (!isValid)
        return ServiceResponse.failure(
          "Invalid email or password",
          null,
          StatusCodes.BAD_REQUEST
        );

      account = await accountService.accountRepository.update({
        where: { email: account.email },
        data: { last_login: new Date() },
      });

      const tokens = JwtHelper.generateTokens({
        sub: account.id,
        email: account.email,
        role: account.role,
      });

      // mailService.sendMail({
      //   to: account.email,
      //   subject: "New Login Detected",
      //   text: `You logged in on ${new Date().toLocaleString()}. If this wasn't you, reset your password immediately.`,
      // });
      const { password, ...rest } = account;

      return ServiceResponse.success<{
        account: Omit<Account, "password">;
        tokens: TokenPair;
      }>("Successfully logged in", { account: rest, tokens });
    } catch (error) {
      logger.error(`Error logging in: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while logging in",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async forgotPassword(payload: ForgotPassword) {
    try {
      const account = await accountService.accountRepository.findByEmail(
        payload.email
      );
      if (!account)
        return ServiceResponse.failure(
          "No account found with this email",
          null,
          StatusCodes.BAD_REQUEST
        );

      const otp = this.generateOtpCode();
      await Promise.all([
        accountService.accountRepository.update({
          where: { email: payload.email },
          data: { otp, otp_expires_at: this.getOtpExpiry() },
        }),
        mailService.sendMail({
          to: payload.email,
          subject: "Password Reset Code",
          text: `Your password reset code is ${otp}. It expires in ${this.OTP_EXPIRY_HOURS} hours.`,
        }),
      ]);

      return ServiceResponse.success<boolean>(
        "Password reset code sent successfully",
        true
      );
    } catch (error) {
      logger.error(`Error in forgot password: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while processing password reset",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async resetPassword(payload: ResetPassword) {
    try {
      const account = await accountService.accountRepository.findByOtp(
        payload.token
      );
      if (!account)
        return ServiceResponse.failure(
          "Account not found",
          null,
          StatusCodes.BAD_REQUEST
        );

      const hashed = await BcryptHelper.hash(payload.new_password);
      await Promise.all([
        accountService.accountRepository.update({
          where: { email: account.email },
          data: { password: hashed, otp: null, otp_expires_at: null },
        }),
        mailService.sendMail({
          to: account.email,
          subject: "Password Changed",
          text: "Your password was successfully changed. If this wasn’t you, please contact support immediately.",
        }),
      ]);

      return ServiceResponse.success<boolean>(
        "Password updated successfully",
        true
      );
    } catch (error) {
      logger.error(`Error changing password: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while changing password",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async changePassword(email: string, payload: ChangePassword) {
    try {
      const account = await accountService.accountRepository.findByEmail(email);
      if (!account)
        return ServiceResponse.failure(
          "Account not found",
          null,
          StatusCodes.BAD_REQUEST
        );

      const isValid = await BcryptHelper.compare(
        payload.password,
        account.password!
      );
      if (!isValid)
        return ServiceResponse.failure(
          "Invalid old password",
          null,
          StatusCodes.BAD_REQUEST
        );

      const hashed = await BcryptHelper.hash(payload.new_password);
      await accountService.accountRepository.update({
        where: { email: account.email },
        data: { password: hashed },
      });

      await mailService.sendMail({
        to: account.email,
        subject: "Password Changed",
        text: "Your password was successfully changed. If this wasn’t you, please reset it immediately.",
      });

      return ServiceResponse.success<boolean>(
        "Password updated successfully",
        true
      );
    } catch (error) {
      logger.error(`Error changing password: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while changing password",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async resendOtp(payload: ResendOtp) {
    try {
      const account = await accountService.accountRepository.findByEmail(
        payload.email
      );
      if (!account)
        return ServiceResponse.failure(
          "No account found with this email",
          null,
          StatusCodes.BAD_REQUEST
        );

      const otp = this.generateOtpCode();

      await Promise.all([
        accountService.accountRepository.update({
          where: { email: payload.email },
          data: { otp, otp_expires_at: this.getOtpExpiry() },
        }),
        mailService.sendMail({
          to: payload.email,
          subject: "New OTP Code",
          text: `Your new OTP is ${otp}. It expires in ${this.OTP_EXPIRY_HOURS} hours.`,
        }),
      ]);

      return ServiceResponse.success<boolean>("OTP resent successfully", true);
    } catch (error) {
      logger.error(`Error resending OTP: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while resending OTP",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const authService = new AuthService();
