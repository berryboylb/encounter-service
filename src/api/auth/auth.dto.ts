import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { Role } from "@/generated/prisma";
import { commonValidations } from "@/common/utils/commonValidation";
extendZodWithOpenApi(z);


export const CreateAccountSchema = z.object({
  password: z.string().min(8),
  email: z.string().email(),
  role: z.enum([Role.Patient, Role.Provider]),
});
export type CreateAccount = z.infer<typeof CreateAccountSchema>;

export const LoginSchema = z.object({
  password: z.string().min(8),
  email: z.string().email(),
});

export type Login = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  new_password: z.string().min(8),
});

export type ResetPassword = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  password: z.string().min(8),
  new_password: z.string().min(8),
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

export const ResendOtpSchema = z.object({
  email: z.string().email(),
});

export type ResendOtp = z.infer<typeof ResendOtpSchema>;

export const VerifyEmailSchema = z.object({
  otp: z.string().min(1),
});

export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;

export const AccountSchema = commonValidations.baseSchema.extend({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "hashed_password" }),
  role: z.nativeEnum(Role).openapi({ example: "Patient" }),
  otp: z.string().nullable().optional().openapi({ example: "482913" }),
  otp_expires_at: z
    .date()
    .nullable()
    .optional()
    .openapi({ example: "2025-10-22T12:00:00.000Z" }),
  is_email_verified: z
    .boolean()
    .nullable()
    .optional()
    .openapi({ example: true }),
  last_login: z
    .date()
    .nullable()
    .optional()
    .openapi({ example: "2025-10-21T18:35:00.000Z" }),
});
