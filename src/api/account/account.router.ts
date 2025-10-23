import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { GetUserSchema, UserSchema } from "@/api/account/account.dto";
import { AccountSchema } from "../auth/auth.dto";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { accountController } from "./account.controller";
import { authMiddleware } from "@/common/middleware/auth";
import { validate, validateQuery } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const accountRegistry = new OpenAPIRegistry();
export const accountRouter: Router = express.Router();




accountRegistry.registerPath({
  method: "get",
  path: "/api/v1/accounts/me",
  tags: ["Account"],
  // request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(AccountSchema, "Success"),
});

accountRouter.get("/me", authMiddleware, accountController.getMe);


accountRegistry.registerPath({
  method: "get",
  path: "/api/v1/accounts",
  tags: ["Account"],
  // request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(AccountSchema, "Success"),
});

accountRouter.get(
  "/",
  validateQuery(commonValidations.query),
  accountController.getAccounts
);





