import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
  BranchSchema,
  UpdateBranchSchema,
  CreateBranchSchema,
} from "@/api/branch/branch.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { branchController } from "@/api/branch/branch.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const branchRegistry = new OpenAPIRegistry();
export const branchRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
branchRegistry.register("Branch", BranchSchema);
branchRegistry.register("UpdateBranchSchema", UpdateBranchSchema);
branchRegistry.register("CreateBranchSchema", CreateBranchSchema);

// ===============================
// POST /branch
// ===============================
branchRegistry.registerPath({
  method: "post",
  path: "/api/v1/branch",
  tags: ["Branch"],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateBranchSchema },
      },
      description: "Data to create a new branch",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(BranchSchema, "Branch created successfully"),
});

branchRouter.post(
  "/",
  authMiddleware,
  roleGuard(Role.Provider),
  validate(CreateBranchSchema),
  branchController.create
);

// ===============================
// PATCH /branch/:id
// ===============================
branchRegistry.registerPath({
  method: "patch",
  path: "/api/v1/branch/{id}",
  tags: ["Branch"],
  request: {
    body: {
      content: {
        "application/json": { schema: UpdateBranchSchema },
      },
      description: "Data to update an existing branch",
      required: true,
    },
    // params: commonValidations.id,
  },
  security: [],
  responses: createApiResponse(BranchSchema, "Branch updated successfully"),
});

branchRouter.patch(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider),
  validate(UpdateBranchSchema),
  branchController.update
);

// ===============================
// DELETE /branch/:id
// ===============================
branchRegistry.registerPath({
  method: "delete",
  path: "/api/v1/branch/{id}",
  tags: ["Branch"],
  //   request: { params: commonValidations.id },
  security: [],
  responses: createApiResponse(BranchSchema, "Branch deleted successfully"),
});

branchRouter.delete(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin, Role.SuperAdmin),
  validate(commonValidations.params, "params"),
  branchController.delete
);

// ===============================
// GET /branch
// ===============================
branchRegistry.registerPath({
  method: "get",
  path: "/api/v1/branch",
  tags: ["Branch"],
  security: [],
  responses: createApiResponse(
    BranchSchema.array(),
    "Branches fetched successfully"
  ),
});

branchRouter.get("/", authMiddleware, branchController.getBranches);



// ===============================
// GET /branch/metrics
// ===============================
branchRegistry.registerPath({
  method: "get",
  path: "/api/v1/branch/metrics",
  tags: ["Branch"],
  security: [],
  responses: createApiResponse(
    z.object({
      total: z.number(),
      active: z.number(),
      inactive: z.number(),
    }),
    "Metrics fetched successfully"
  ),
});

branchRouter.get("/metrics", authMiddleware, branchController.getMetrics);


// ===============================
// GET /branch/:id
// ===============================
branchRegistry.registerPath({
  method: "get",
  path: "/api/v1/branch/{id}",
  tags: ["Branch"],
  //   request: { params: commonValidations.id },
  security: [],
  responses: createApiResponse(BranchSchema, "Branch fetched successfully"),
});

branchRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  branchController.getBranch
);

// ===============================
// GET /branch/metrics/{provider_id}
// ===============================
branchRegistry.registerPath({
  method: "get",
  path: "/api/v1/branch/metrics/{provider_id}",
  tags: ["Branch"],
  //   request: { params: commonValidations.id },
  security: [],
  responses: createApiResponse(
    z.object({
      total: z.number(),
      active: z.number(),
      inactive: z.number(),
    }),
    "Metrics fetched successfully"
  ),
});

branchRouter.get(
  "/metrics/:provider_id",
  authMiddleware,
  branchController.getProviderBranchMetrics
);

// ===============================
// PATCH /branch/:id/toggle-availability
// ===============================
branchRegistry.registerPath({
  method: "patch",
  path: "/api/v1/branch/:id/toggle-availability",
  tags: ["Branch"],
  //   request: { params: commonValidations.id },
  security: [],
  responses: createApiResponse(
    BranchSchema,
    "Branch availability toggled successfully"
  ),
});

branchRouter.patch(
  "/:id/toggle-availability",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin, Role.SuperAdmin),
  validate(commonValidations.id, "params"),
  branchController.toggleAvailability
);
