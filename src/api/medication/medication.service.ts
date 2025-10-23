import { StatusCodes } from "http-status-codes";
import { MedicationRepository } from "@/api/medication/medication.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Medication, Account, Role } from "@/generated/prisma";
import { logger } from "@/server";
import {
  CreateMedication,
  MedicationMetrics,
  UpdateMedication,
} from "./medication.dto";
import { providerService } from "@/api/provider/provider.service";
import { baseFilter, PaginatedOptions } from "@/types/express.types";

export class MedicationService {
  constructor(
    public readonly medicationRepository = new MedicationRepository()
  ) {}

  async create(
    data: CreateMedication
  ): Promise<ServiceResponse<Medication | null>> {
    try {
      const medication = await this.medicationRepository.create({ data });
      return ServiceResponse.success(
        "Medication created successfully",
        medication
      );
    } catch (error) {
      logger.error(`Error creating medication: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to create medication",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Medication | null>> {
    try {
      const encounter = await this.medicationRepository.findById(id);

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Medication>("Medication found", encounter);
    } catch (error) {
      logger.error(`Error fetching Medication: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while finding Medication",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Medication[]> | null>> {
    try {
      const encounters = await this.medicationRepository.findPaginated(
        options ?? {}
      );

      return ServiceResponse.success<PaginatedOptions<Medication[]> | null>(
        "Medication found",
        encounters
      );
    } catch (error) {
      logger.error(
        `Error fetching all Medication: ${(error as Error).message}`
      );

      return ServiceResponse.failure(
        "An error occurred while retrieving Medications",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    data: UpdateMedication,
    account: Account
  ): Promise<ServiceResponse<Medication | null>> {
    try {
      let medication = await this.medicationRepository.findOne({
        where: { id },
      });

      if (!medication) {
        return ServiceResponse.failure(
          "Medication not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (account.role === Role.Provider) {
        const provider = await providerService.providerRepository.findOne({
          where: { account_id: account.id },
        });

        if (!provider) {
          return ServiceResponse.failure(
            "Provider not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (provider.id.toString() !== medication.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this medication",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      medication = await this.medicationRepository.update({
        where: { id },
        data,
      });
      return ServiceResponse.success(
        "Medication updated successfully",
        medication
      );
    } catch (error) {
      logger.error(`Error updating medication: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update medication",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMetrics(
    payload: MedicationMetrics
  ): Promise<ServiceResponse<number | null>> {
    try {
      const metrics = await this.medicationRepository.getMetrics(payload);
      return ServiceResponse.success("Medication metrics fetched", metrics);
    } catch (error) {
      logger.error(
        `Error fetching medication metrics: ${(error as Error).message}`
      );
      return ServiceResponse.failure(
        "Failed to fetch medication metrics",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const medicationService = new MedicationService();
