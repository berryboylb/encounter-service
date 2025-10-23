import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
  UpdateProviderSchema,
  ProviderSchema,
} from "@/api/provider/provider.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { providerController } from "@/api/provider/provider.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const providerRegistry = new OpenAPIRegistry();
export const providerRouter: Router = express.Router();
// ===============================
// Register Schemas
// ===============================
providerRegistry.register("UpdateProviderSchema", UpdateProviderSchema);
providerRegistry.register("Provider", ProviderSchema);

// ===============================
// PATCH /provider/me
// ===============================

providerRegistry.registerPath({
  method: "patch",
  path: "/api/v1/provider/me",
  tags: ["Provider"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProviderSchema, // Or z.ref('PostRequestBody') if registered
        },
      },
      description: "Data for the new item",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.patch(
  "/me",
  authMiddleware,
  roleGuard(Role.Provider), // ✅ widen literal to string
  validate(UpdateProviderSchema),
  providerController.updateProfile
);

// ===============================
// PATCH /provider/me/toggle-availability
// ===============================

providerRegistry.registerPath({
  method: "patch",
  path: "/api/v1/provider/me/toggle-availability",
  tags: ["Provider"],
  request: {
    body: {
      content: {},
      description: "Data for the new item",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.patch(
  "/me/toggle-availability",
  authMiddleware,
  roleGuard(Role.Provider),
  providerController.toggleAvailability
);

// ===============================
// GET /provider/me
// ===============================

providerRegistry.registerPath({
  method: "get",
  path: "/api/v1/provider/me",
  tags: ["Provider"],
  security: [],
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.get(
  "/me",
  authMiddleware,
  roleGuard(Role.Provider),
  providerController.findProfile
);

// ===============================
// GET /provider
// ===============================

providerRegistry.registerPath({
  method: "get",
  path: "/api/v1/provider",
  tags: ["Provider"],
  security: [],
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.get("/", authMiddleware, providerController.getProviders);

// ===============================
// GET /provider/:id
// ===============================

providerRegistry.registerPath({
  method: "get",
  path: "/api/v1/provider/{id}",
  tags: ["Provider"],
  security: [],
  //   request: { params: commonValidations.id },
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  providerController.getProvider
);

// ===============================
// DELETE /provider/me
// ===============================

providerRegistry.registerPath({
  method: "delete",
  path: "/api/v1/provider/me",
  tags: ["Provider"],
  security: [],
  //   request: { params: commonValidations.id },
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.delete(
  "/me",
  authMiddleware,
  roleGuard(Role.Provider),
  providerController.deleteMyProviderProfile
);


// ===============================
// DELETE /provider/:id
// ===============================

providerRegistry.registerPath({
  method: "delete",
  path: "/api/v1/provider/{id}",
  tags: ["Provider"],
  security: [],
  //   request: { params: commonValidations.id },
  responses: createApiResponse(ProviderSchema, "Account created successfully"), // ✅ use .openapi
});

providerRouter.delete(
  "/:id",
  authMiddleware,
  roleGuard(Role.SuperAdmin, Role.Admin),
  validate(commonValidations.params, "params"),
  providerController.deleteProvider
);

// ✅ Single provider by ID (admin)
providerRouter.get(
  "/:id/metrics",
  authMiddleware,
  // roleGuard(Role.Admin, Role.SuperAdmin, Role.Provider),
  validate(commonValidations.id, "params"),
  providerController.getMetric
);

// ✅ Multiple providers metrics (admin dashboard)
providerRouter.get(
  "/metrics",
  authMiddleware,
  // roleGuard(Role.Admin, Role.SuperAdmin),
  providerController.getMetrics
);