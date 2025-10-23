import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import {
  CreateEncounterSchema,
  UpdateEncounterSchema,
  EncounterSchema,
  MetricsSchema,
  EncounterMetricsSchema,
} from "@/api/encounter/encounter.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { encounterController } from "@/api/encounter/encounter.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate, validateQuery } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const encounterRegistry = new OpenAPIRegistry();
export const encounterRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
encounterRegistry.register("Encounter", EncounterSchema);
encounterRegistry.register("CreateEncounterSchema", CreateEncounterSchema);
encounterRegistry.register("UpdateEncounterSchema", UpdateEncounterSchema);
encounterRegistry.register("MetricsSchema", MetricsSchema);
encounterRegistry.register("EncounterMetricsSchema", EncounterMetricsSchema);

// ===============================
// POST /encounter
// ===============================
encounterRegistry.registerPath({
  method: "post",
  path: "/api/v1/encounter",
  tags: ["Encounter"],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateEncounterSchema },
      },
      description: "Data to create a new encounter",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter created successfully"
  ),
});

encounterRouter.post(
  "/",
  authMiddleware,
  // roleGuard(Role.Provider),
  validate(CreateEncounterSchema),
  encounterController.create
);

// ===============================
// PATCH /encounter/:id
// ===============================
encounterRegistry.registerPath({
  method: "patch",
  path: "/api/v1/encounter/{id}",
  tags: ["Encounter"],
  request: {
    params: commonValidations.params,
    body: {
      content: {
        "application/json": { schema: UpdateEncounterSchema },
      },
      description: "Data to update an encounter",
      required: true,
    },
  },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter updated successfully"
  ),
});

encounterRouter.patch(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Patient),
  validate(commonValidations.params, "params"),
  validate(UpdateEncounterSchema),
  encounterController.update
);

// ===============================
// DELETE /encounter/:id
// ===============================
encounterRegistry.registerPath({
  method: "delete",
  path: "/api/v1/encounter/{id}",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter deleted successfully"
  ),
});

encounterRouter.delete(
  "/:id",
  authMiddleware,
  roleGuard(Role.Provider, Role.Admin, Role.SuperAdmin),
  validate(commonValidations.params, "params"),
  encounterController.delete
);

// ===============================
// GET /encounter
// ===============================
encounterRegistry.registerPath({
  method: "get",
  path: "/api/v1/encounter",
  tags: ["Encounter"],
  security: [],
  responses: createApiResponse(
    EncounterSchema.array(),
    "Encounters fetched successfully"
  ),
});

encounterRouter.get("/", authMiddleware, encounterController.getEncounters);

// ===============================
// GET /encounter/metrics
// ===============================
encounterRegistry.registerPath({
  method: "get",
  path: "/api/v1/encounter/metrics",
  tags: ["Encounter"],
  request: {
    query: MetricsSchema,
  },
  security: [],
  responses: createApiResponse(
    EncounterMetricsSchema,
    "Encounter metrics fetched successfully"
  ),
});

encounterRouter.get(
  "/metrics",
  authMiddleware,
  validateQuery(MetricsSchema),
  encounterController.getMetrics
);

// ===============================
// GET /encounter/:id
// ===============================
encounterRegistry.registerPath({
  method: "get",
  path: "/api/v1/encounter/{id}",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter fetched successfully"
  ),
});

encounterRouter.get(
  "/:id",
  authMiddleware,
  validate(commonValidations.params, "params"),
  encounterController.getEncounter
);

// ===============================
// PATCH /encounter/:id/start
// ===============================
encounterRegistry.registerPath({
  method: "patch",
  path: "/api/v1/encounter/{id}/start",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter started successfully"
  ),
});

encounterRouter.patch(
  "/:id/start",
  authMiddleware,
  roleGuard(Role.Provider, Role.Patient),
  validate(commonValidations.params, "params"),
  encounterController.startEncounter
);

// ===============================
// PATCH /encounter/:id/complete
// ===============================
encounterRegistry.registerPath({
  method: "patch",
  path: "/api/v1/encounter/{id}/complete",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter completed successfully"
  ),
});

encounterRouter.patch(
  "/:id/complete",
  authMiddleware,
  roleGuard(Role.Provider, Role.Patient),
  validate(commonValidations.params, "params"),
  encounterController.completeEncounter
);

// ===============================
// PATCH /encounter/:id/cancel
// ===============================
encounterRegistry.registerPath({
  method: "patch",
  path: "/api/v1/encounter/{id}/cancel",
  tags: ["Encounter"],
  request: { params: commonValidations.params },
  security: [],
  responses: createApiResponse(
    EncounterSchema,
    "Encounter canceled successfully"
  ),
});

encounterRouter.patch(
  "/:id/cancel",
  authMiddleware,
  roleGuard(Role.Provider, Role.Patient, Role.Admin),
  validate(commonValidations.params, "params"),
  encounterController.cancelEncounter
);


