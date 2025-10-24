import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { CreateTestSchema, UpdateTestSchema, TestSchema } from "./test.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { testController } from "./test.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const testRegistry = new OpenAPIRegistry();
export const testRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
testRegistry.register("Test", TestSchema);
testRegistry.register("CreateTestSchema", CreateTestSchema);
testRegistry.register("UpdateTestSchema", UpdateTestSchema);

// ===============================
// Routes
// ===============================

// Create test
testRegistry.registerPath({
  method: "post",
  path: "/tests",
  tags: ["Test"],
  request: {
    body: { content: { "application/json": { schema: CreateTestSchema } } },
  },
  responses: createApiResponse(TestSchema, "Test created successfully"),
});
testRouter.post(
  "/",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(CreateTestSchema),
  testController.create
);

// Update test
testRegistry.registerPath({
  method: "patch",
  path: "/tests/{id}",
  tags: ["Test"],
  request: {
    params: z.object({ id: commonValidations.id }),
    body: { content: { "application/json": { schema: UpdateTestSchema } } },
  },
  responses: createApiResponse(TestSchema, "Test updated successfully"),
});
testRouter.patch(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(UpdateTestSchema),
  testController.update
);

// Get metrics
testRegistry.registerPath({
  method: "get",
  path: "/tests/metrics",
  tags: ["Test"],
  responses: createApiResponse(z.any(), "Test metrics retrieved successfully"),
});
testRouter.get(
  "/metrics",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  testController.metrics
);

// Get all tests
testRegistry.registerPath({
  method: "get",
  path: "/tests",
  tags: ["Test"],
  security: [],
  responses: createApiResponse(
    TestSchema.array(),
    "Tests fetched successfully"
  ),
});
testRouter.get("/", authMiddleware, testController.getTests);

// Get single test
testRegistry.registerPath({
  method: "get",
  path: "/tests/{id}",
  tags: ["Test"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(TestSchema, "Test fetched successfully"),
});
testRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  testController.getTest
);

// Approve test
testRegistry.registerPath({
  method: "patch",
  path: "/tests/{id}/approve",
  tags: ["Test"],
  request: { params: z.object({ id: commonValidations.id }) },
  responses: createApiResponse(TestSchema, "Test approved successfully"),
});
testRouter.patch(
  "/:id/approve",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(commonValidations.params, "params"),
  testController.approve
);

// Reject test
testRegistry.registerPath({
  method: "patch",
  path: "/tests/{id}/reject",
  tags: ["Test"],
  request: { params: z.object({ id: commonValidations.id }) },
  responses: createApiResponse(TestSchema, "Test rejected successfully"),
});
testRouter.patch(
  "/:id/reject",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(commonValidations.params, "params"),
  testController.reject
);

// Delete test
testRegistry.registerPath({
  method: "delete",
  path: "/tests/{id}",
  tags: ["Test"],
  request: { params: z.object({ id: commonValidations.id }) },
  responses: createApiResponse(z.boolean(), "Test deleted successfully"),
});
testRouter.delete(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(commonValidations.params, "params"),
  testController.delete
);
