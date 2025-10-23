import { StatusCodes } from "http-status-codes";
import { PatientRepository } from "@/api/patient/patient.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Patient } from "@/generated/prisma";
import { logger } from "@/server";
import { UpdatePatient } from "@/api/patient/patient.dto";
import { baseFilter, PaginatedOptions } from "@/types/express.types";

export class PatientService {
  constructor(public readonly patientRepository = new PatientRepository()) {}

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Patient[]> | null>> {
    try {
     const paginatedOptions = {
       ...options,
       ...(options?.search
         ? {
             searchFields: options.searchFields ?? [
               "first_name",
               "last_name",
               "gender",
               "blood_group",
               "genotype",
               "address",
               "phone_number",
               "hmo_id",
             ],
           }
         : {}),
     };
      const patients = await this.patientRepository.findPaginated(
        paginatedOptions
      );

      return ServiceResponse.success<PaginatedOptions<Patient[]> | null>(
        "Patients found",
        patients
      );
    } catch (error) {
      logger.error(`Error fetching all patients: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while retrieving patients.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Patient | null>> {
    try {
      const patient = await this.patientRepository.findById(id);
      if (!patient)
        return ServiceResponse.failure(
          `Patient not found`,
          null,
          StatusCodes.NOT_FOUND
        );

      return ServiceResponse.success<Patient>("Patient found", patient);
    } catch (error) {
      logger.error(`Error fetching patient: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while retrieving patients.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string) {
    try {
      const existingPatient = await this.patientRepository.findOne({
        where: { OR: [{ id }, { account_id: id }] },
      });

      if (!existingPatient) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      await this.patientRepository.delete({
        where: { id: existingPatient.id },
      });

      return ServiceResponse.success<true>(
        "Patient deleted successfully",
        true
      );
    } catch (error) {
      logger.error(`Error deleting patient: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while deleting the patient.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findProfile(id: string): Promise<ServiceResponse<Patient | null>> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { account_id: id },
      });

      if (!patient) {
        return ServiceResponse.failure(
          "No patient profile found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Patient>("Patient found", patient);
    } catch (error) {
      logger.error(
        `Error fetching patient profile: ${(error as Error).message}`
      );
      return ServiceResponse.failure(
        "An error occurred while retrieving patient profile.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateProfile(
    id: string,
    data: UpdatePatient
  ): Promise<ServiceResponse<Patient | null>> {
    try {
      const patient = await this.patientRepository.upsert({
        where: { id },
        update: data,
        create: { account_id: id, ...data },
      });

      if (!patient) {
        return ServiceResponse.failure(
          "No patient profile found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Patient>("Patient Updated", patient);
    } catch (error) {
      logger.error(`Error updating patient: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while updating patient profile.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const patientService = new PatientService();
