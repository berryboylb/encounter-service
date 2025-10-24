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
  responses: createApiResponse(ReferralSchema, "Referral created successfully"),
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
  responses: createApiResponse(ReferralSchema, "Referral updated successfully"),
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
  responses: createApiResponse(
    z.any(),
    "Referral metrics retrieved successfully"
  ),
});
referralRouter.get(
  "/metrics",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  referralController.metrics
);

// Get all referrals
referralRegistry.registerPath({
  method: "get",
  path: "/referrals",
  tags: ["Referral"],
  security: [],
  responses: createApiResponse(
    ReferralSchema.array(),
    "Referrals fetched successfully"
  ),
});
referralRouter.get("/", authMiddleware, referralController.getReferrals);

// Get single referral
referralRegistry.registerPath({
  method: "get",
  path: "/referrals/{id}",
  tags: ["Referral"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(ReferralSchema, "Referral fetched successfully"),
});
referralRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  referralController.getReferral
);

// Approve referral
referralRegistry.registerPath({
  method: "patch",
  path: "/referrals/{id}/approve",
  tags: ["Referral"],
  request: { params: z.object({ id: commonValidations.id }) },
  responses: createApiResponse(
    ReferralSchema,
    "Referral approved successfully"
  ),
});
referralRouter.patch(
  "/:id/approve",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(commonValidations.params, "params"),
  referralController.approve
);

// Reject referral
referralRegistry.registerPath({
  method: "patch",
  path: "/referrals/{id}/reject",
  tags: ["Referral"],
  request: { params: z.object({ id: commonValidations.id }) },
  responses: createApiResponse(
    ReferralSchema,
    "Referral rejected successfully"
  ),
});
referralRouter.patch(
  "/:id/reject",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(commonValidations.params, "params"),
  referralController.reject
);

// Mark referral as ongoing
// referralRegistry.registerPath({
//   method: "patch",
//   path: "/referrals/{id}/ongoing",
//   tags: ["Referral"],
//   request: { params: z.object({ id: commonValidations.id }) },
//   responses: createApiResponse(
//     ReferralSchema,
//     "Referral marked as ongoing successfully"
//   ),
// });
// referralRouter.patch(
//   "/:id/ongoing",
//   authMiddleware,
//   roleGuard(Role.Provider, Role.Admin),
//   validate(commonValidations.params, "params"),
//   referralController.markOngoing
// );

// Complete referral
// referralRegistry.registerPath({
//   method: "patch",
//   path: "/referrals/{id}/complete",
//   tags: ["Referral"],
//   request: { params: z.object({ id: commonValidations.id }) },
//   responses: createApiResponse(
//     ReferralSchema,
//     "Referral completed successfully"
//   ),
// });
// referralRouter.patch(
//   "/:id/complete",
//   authMiddleware,
//   roleGuard(Role.Provider, Role.Admin),
//   validate(commonValidations.params, "params"),
//   referralController.complete
// );

// Delete referral
referralRegistry.registerPath({
  method: "delete",
  path: "/referrals/{id}",
  tags: ["Referral"],
  request: { params: z.object({ id: commonValidations.id }) },
  responses: createApiResponse(z.boolean(), "Referral deleted successfully"),
});
referralRouter.delete(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(commonValidations.params, "params"),
  referralController.delete
);
