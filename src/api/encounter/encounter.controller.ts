import type { Request, RequestHandler, Response } from "express";
import { CreateEncounter, UpdateEncounter } from "../encounter/encounter.dto";
import { encounterService } from "@/api/encounter/encounter.service";
import { baseFilter } from "@/types/express.types";

class EncounterController {}

export const encounterController = new EncounterController();
