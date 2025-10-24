import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
  CreateMedicationSchema,
  UpdateMedicationSchema,
  MedicationSchema,
} from "./medication.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { medicationController } from "./medication.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const medicationRegistry = new OpenAPIRegistry();
export const medicationRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
medicationRegistry.register("Medication", MedicationSchema);
medicationRegistry.register("CreateMedicationSchema", CreateMedicationSchema);
medicationRegistry.register("UpdateMedicationSchema", UpdateMedicationSchema);

// ===============================
// Routes
// ===============================

// Create medication
medicationRegistry.registerPath({
  method: "post",
  path: "/medications",
  tags: ["Medication"],
  request: {
    body: {
      content: { "application/json": { schema: CreateMedicationSchema } },
    },
  },
  responses: createApiResponse(MedicationSchema, "Success"),
});
medicationRouter.post(
  "/",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(CreateMedicationSchema),
  medicationController.create
);

// Update medication
medicationRegistry.registerPath({
  method: "patch",
  path: "/medications/{id}",
  tags: ["Medication"],
  request: {
    params: z.object({ id: commonValidations.id }),
    body: {
      content: { "application/json": { schema: UpdateMedicationSchema } },
    },
  },
  responses: createApiResponse(MedicationSchema, "Updated successfully"),
});
medicationRouter.patch(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  validate(UpdateMedicationSchema),
  medicationController.update
);

// Get metrics
medicationRegistry.registerPath({
  method: "get",
  path: "/medications/metrics",
  tags: ["Medication"],
  responses: createApiResponse(z.any(), "Metrics retrieved successfully"),
});
medicationRouter.get(
  "/metrics",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin),
  medicationController.metrics
);

// ===============================
// GET /medications
// ===============================
medicationRegistry.registerPath({
  method: "get",
  path: "/api/v1/medications",
  tags: ["Encounter"],
  security: [],
  responses: createApiResponse(
    MedicationSchema.array(),
    "Medications fetched successfully"
  ),
});

medicationRouter.get("/", authMiddleware, medicationController.getMedications);

// ===============================
// GET /medications/:id
// ===============================
medicationRegistry.registerPath({
  method: "get",
  path: "/api/v1/medications/{id}",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    MedicationSchema,
    "Encounter fetched successfully"
  ),
});

medicationRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  medicationController.getMedication
);


// ===============================
// DELETE /encounter/:id
// ===============================
medicationRegistry.registerPath({
  method: "delete",
  path: "/api/v1/encounter/{id}",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    MedicationSchema,
    "Encounter deleted successfully"
  ),
});

medicationRouter.delete(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin, Role.SuperAdmin),
  validate(commonValidations.params, "params"),
  medicationController.delete
);