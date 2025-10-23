import type { Request, RequestHandler, Response } from "express";
import type {
  CreateAccount,
  Login,
  ForgotPassword,
  ChangePassword,
  ResendOtp,
  VerifyEmail,
  ResetPassword,
} from "@/api/auth/auth.dto";
import { authService } from "@/api/auth/auth.service";

class AuthController {
  // ✅ Register new user
  public register: RequestHandler = async (
    req: Request<{}, {}, CreateAccount>,
    res: Response
  ) => {
    const serviceResponse = await authService.register(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Login user
  public login: RequestHandler = async (
    req: Request<{}, {}, Login>,
    res: Response
  ) => {
    const serviceResponse = await authService.login(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Forgot password (send reset token)
  public forgotPassword: RequestHandler = async (
    req: Request<{}, {}, ForgotPassword>,
    res: Response
  ) => {
    const serviceResponse = await authService.forgotPassword(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Reset password
  public restPassword: RequestHandler = async (
    req: Request<{}, {}, ResetPassword>,
    res: Response
  ) => {
    const serviceResponse = await authService.resetPassword(
      req.body
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Change password
  public changePassword: RequestHandler = async (
    req: Request<{}, {}, ChangePassword>,
    res: Response
  ) => {
    const serviceResponse = await authService.changePassword(
      req.account?.email!,
      req.body
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Verify email (via OTP)
  public verifyEmail: RequestHandler = async (
    req: Request<{}, {}, VerifyEmail>,
    res: Response
  ) => {
    const serviceResponse = await authService.verifyEmail(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Resend OTP
  public resendOtp: RequestHandler = async (
    req: Request<{}, {}, ResendOtp>,
    res: Response
  ) => {
    const serviceResponse = await authService.resendOtp(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const authController = new AuthController();
