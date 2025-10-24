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
import { patientService } from "@/api/patient/patient.service";
import { encounterService } from "@/api/encounter/encounter.service";
import { generateTrackingId } from "@/common/utils/tracking";

export class MedicationService {
  constructor(
    public readonly medicationRepository = new MedicationRepository()
  ) {}

  async create(
    data: CreateMedication
  ): Promise<ServiceResponse<Medication | null>> {
    try {
      const [provider, patient, encounter] = await Promise.all([
        providerService.providerRepository.findOne({
          where: { id: data.provider_id },
        }),
        patientService.patientRepository.findOne({
          where: {
            id: data.patient_id,
          },
        }),
        encounterService.encounterRepository.findOne({
          where: {
            id: data.encounter_id,
          },
        }),
      ]);

      if (!provider) {
        return ServiceResponse.failure(
          "Provider not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (!patient) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const medication = await this.medicationRepository.create({
        data: {
          ...data,
          tracking_id: generateTrackingId(),
        },
      });
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
      const encounter = await this.medicationRepository.findById(id, {
        include: {
          encounter: true,
          provider: true,
          patient: true,
        },
      });

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
      const paginatedOptions = {
        ...options,
        ...(options?.search
          ? {
              searchFields: options.searchFields ?? [
                "name",
                "dosage",
                "frequency",
                "duration",
                "instruction",
                "drug_form",
              ],
            }
          : {}),
        include: {
          encounter: true,
          provider: true,
          patient: true,
        },
      };
      const encounters = await this.medicationRepository.findPaginated(
        paginatedOptions
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

  async delete(
    id: string,
    role: Role,
    account_id: string
  ): Promise<ServiceResponse<true | null>> {
    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
      });

      if (!medication) {
        return ServiceResponse.failure(
          "medication not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (role === Role.Provider) {
        const provider = await providerService.providerRepository.findOne({
          where: { account_id },
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
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      await this.medicationRepository.delete({
        where: { id: medication.id },
      });

      return ServiceResponse.success<true>(
        "Encounter deleted successfully",
        true
      );
    } catch (error) {
      logger.error(`Error deleting encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while deleting encounter",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const medicationService = new MedicationService();
