import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import {
  CreateEncounterSchema,
  UpdateEncounterSchema,
  EncounterSchema,
} from "../encounter/encounter.dto";
import { Role } from "@/generated/prisma";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { encounterController } from "@/api/encounter/encounter.controller";
import { authMiddleware, roleGuard } from "@/common/middleware/auth";
import { validate } from "@/common/middleware/validator";
import { commonValidations } from "@/common/utils/commonValidation";

export const encounterRegistry = new OpenAPIRegistry();
export const encounterRouter: Router = express.Router();

// ===============================
// Register Schemas
// ===============================
encounterRegistry.register("Encounter", EncounterSchema);
encounterRegistry.register("UpdateEncounterSchema", UpdateEncounterSchema);
encounterRegistry.register("CreateEncounterSchema", CreateEncounterSchema);
