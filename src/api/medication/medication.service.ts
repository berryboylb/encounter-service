import { StatusCodes } from "http-status-codes";
import { MedicationRepository } from "@/api/medication/medication.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Medication } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateMedication, UpdateMedication } from "./medication.dto";

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

  async update(
    id: string,
    data: UpdateMedication
  ): Promise<ServiceResponse<Medication | null>> {
    try {
      const medication = await this.medicationRepository.update({
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

  async getMetrics(provider_id?: string): Promise<ServiceResponse<any>> {
    try {
      //   const metrics = await this.medicationRepository.getMetrics(provider_id);
      return ServiceResponse.success("Medication metrics fetched", null);
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
