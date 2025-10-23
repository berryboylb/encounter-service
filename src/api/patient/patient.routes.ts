import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { UpdatePatientSchema, PatientSchema } from "@/api/patient/patient.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { patientController } from "@/api/patient/patient.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const patientRegistry = new OpenAPIRegistry();
export const patientRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
patientRegistry.register("UpdatePatientSchema", UpdatePatientSchema);
patientRegistry.register("Patient", PatientSchema);

// ===============================
// PATCH /patient/me
// ===============================
patientRegistry.registerPath({
  method: "patch",
  path: "/api/v1/patient/me",
  tags: ["Patient"],
  request: {
    body: {
      content: {
        "application/json": { schema: PatientSchema },
      },
      description: "Data to update patient profile",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(
    PatientSchema,
    "Patient profile updated successfully"
  ),
});

patientRouter.patch(
  "/me",
  authMiddleware,
  roleGuard(Role.Patient),
  validate(UpdatePatientSchema),
  patientController.updateProfile
);

// ===============================
// GET /patient/me
// ===============================
patientRegistry.registerPath({
  method: "get",
  path: "/api/v1/patient/me",
  tags: ["Patient"],
  security: [],
  responses: createApiResponse(
    PatientSchema,
    "Patient profile retrieved successfully"
  ),
});

patientRouter.get(
  "/me",
  authMiddleware,
  roleGuard(Role.Patient),
  patientController.findProfile
);

// ===============================
// GET /patient
// ===============================
patientRegistry.registerPath({
  method: "get",
  path: "/api/v1/patient",
  tags: ["Patient"],
  security: [],
  responses: createApiResponse(
    PatientSchema,
    "Patients retrieved successfully"
  ),
});

patientRouter.get("/", authMiddleware, patientController.getPatients);

// ===============================
// GET /patient/:id
// ===============================
patientRegistry.registerPath({
  method: "get",
  path: "/api/v1/patient/{id}",
  tags: ["Patient"],
  security: [],
  // request: { params: commonValidations.id },
  responses: createApiResponse(PatientSchema, "Patient retrieved successfully"),
});

patientRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  patientController.getPatient
);

// ===============================
// DELETE /patient/me
// ===============================
patientRegistry.registerPath({
  method: "delete",
  path: "/api/v1/patient/me",
  tags: ["Patient"],
  security: [],
  responses: createApiResponse(
    PatientSchema,
    "Patient profile deleted successfully"
  ),
});

patientRouter.delete(
  "/me",
  authMiddleware,
  roleGuard(Role.Patient),
  patientController.deleteMyPatientProfile
);

// ===============================
// DELETE /patient/:id
// ===============================
patientRegistry.registerPath({
  method: "delete",
  path: "/api/v1/patient/{id}",
  tags: ["Patient"],
  security: [],
  // request: { params: commonValidations.id },
  responses: createApiResponse(PatientSchema, "Patient deleted successfully"),
});

patientRouter.delete(
  "/:id",
  authMiddleware,
  // roleGuard(Role.SuperAdmin, Role.Admin),
  validate(commonValidations.params, "params"),
  patientController.deletePatient
);
