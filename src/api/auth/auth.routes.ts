import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
  AccountSchema,
  ChangePasswordSchema,
  CreateAccountSchema,
  ForgotPasswordSchema,
  LoginSchema,
  ResendOtpSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from "@/api/auth/auth.dto";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validate } from "@/common/middleware/validator";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./auth.controller";
import { authMiddleware } from "@/common/middleware/auth";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
authRegistry.register("CreateAccount", CreateAccountSchema);
authRegistry.register("Account", AccountSchema);


// POST /auth/register
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateAccountSchema, // Or z.ref('PostRequestBody') if registered
        },
      },
      description: "Data for the new item",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(AccountSchema, "Account created successfully"), // ✅ use .openapi
});

authRouter.post(
  "/register",
  validate(CreateAccountSchema),
  authController.register
);

// ===============================
// POST /auth/login
// ===============================
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema, // Or z.ref('PostRequestBody') if registered
        },
      },
      description: "Data for the Login",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(
    z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      account: AccountSchema,
    }),
    "Login successful"
  ),
});

authRouter.post("/login", validate(LoginSchema), authController.login);

// ===============================
// POST /auth/forgot-password
// ===============================
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/forgot-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordSchema,
        },
      },
      description: "Data for the forgot password",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(z.object({ message: z.string() }), "OTP sent"),
});

authRouter.post(
  "/forgot-password",
  validate(ForgotPasswordSchema),
  authController.forgotPassword
);



// ===============================
// POST /auth/change-password
// ===============================
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/reset-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordSchema,
        },
      },
      description: "Data for the reset password",
      required: true,
    },
  },
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Password updated"
  ),
});

authRouter.post(
  "/reset-password",
  validate(ResetPasswordSchema),
  authController.restPassword
);

// ===============================
// POST /auth/change-password
// ===============================
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/change-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordSchema,
        },
      },
      description: "Data for the forgot password",
      required: true,
    },
  },
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Password updated"
  ),
});

authRouter.post(
  "/change-password",
  validate(ChangePasswordSchema),
  authMiddleware,
  authController.changePassword
);

// ===============================
// POST /auth/verify-email
// ===============================
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify-email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyEmailSchema,
        },
      },
      description: "Data for verify email",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Email verified"
  ),
});

authRouter.post(
  "/verify-email",
  validate(VerifyEmailSchema),
  authController.verifyEmail
);

// ===============================
// POST /auth/resend-otp
// ===============================
authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/resend-otp",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResendOtpSchema,
        },
      },
      description: "Data for resend otp",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(z.object({ message: z.string() }), "OTP resent"),
});

authRouter.post(
  "/resend-otp",

  validate(ResendOtpSchema),
  authController.resendOtp
);
