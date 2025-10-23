import { StatusCodes } from "http-status-codes";
import { EncounterRepository } from "@/api/encounter/encounter.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Encounter, EncounterStatus, EncounterType } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateEncounter, UpdateEncounter } from "../encounter/encounter.dto";
import { baseFilter, PaginatedOptions } from "@/types/express.types";
import { providerService } from "@/api/provider/provider.service";
import { branchService } from "@/api/branch/branch.service";

export class EncounterService {
  constructor(public readonly branchRepository = new EncounterRepository()) {}
}


export const encounterService = new EncounterService();