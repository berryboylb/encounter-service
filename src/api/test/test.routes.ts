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
  responses: createApiResponse(TestSchema, "Success"),
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
  responses: createApiResponse(TestSchema, "Updated successfully"),
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
  responses: createApiResponse(z.any(), "Metrics retrieved successfully"),
});
testRouter.get(
  "/metrics",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  testController.metrics
);
