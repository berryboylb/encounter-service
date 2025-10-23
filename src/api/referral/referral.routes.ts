import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
  CreateReferralSchema,
  UpdateReferralSchema,
  ReferralSchema,
} from "./referral.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { referralController } from "./referral.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const referralRegistry = new OpenAPIRegistry();
export const referralRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
referralRegistry.register("Referral", ReferralSchema);
referralRegistry.register("CreateReferralSchema", CreateReferralSchema);
referralRegistry.register("UpdateReferralSchema", UpdateReferralSchema);

// ===============================
// Routes
// ===============================

// Create referral
referralRegistry.registerPath({
  method: "post",
  path: "/referrals",
  tags: ["Referral"],
  request: {
    body: { content: { "application/json": { schema: CreateReferralSchema } } },
  },
  responses: createApiResponse(ReferralSchema, "Success"),
});
referralRouter.post(
  "/",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(CreateReferralSchema),
  referralController.create
);

// Update referral
referralRegistry.registerPath({
  method: "patch",
  path: "/referrals/{id}",
  tags: ["Referral"],
  request: {
    params: z.object({ id: commonValidations.id }),
    body: { content: { "application/json": { schema: UpdateReferralSchema } } },
  },
  responses: createApiResponse(ReferralSchema, "Updated successfully"),
});
referralRouter.patch(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(UpdateReferralSchema),
  referralController.update
);

// Get metrics
referralRegistry.registerPath({
  method: "get",
  path: "/referrals/metrics",
  tags: ["Referral"],
  responses: createApiResponse(z.any(), "Metrics retrieved successfully"),
});
referralRouter.get(
  "/metrics",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  referralController.metrics
);
