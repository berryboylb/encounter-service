import { StatusCodes } from "http-status-codes";
import { EncounterRepository } from "@/api/encounter/encounter.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import {
  Account,
  Branch,
  Encounter,
  EncounterStatus,
  EncounterType,
  Role,
} from "@/generated/prisma";
import { logger } from "@/server";
import {
  CreateEncounter,
  EncounterMetrics,
  UpdateEncounter,
  Metrics,
} from "../encounter/encounter.dto";
import { baseFilter, PaginatedOptions } from "@/types/express.types";
import { providerService } from "@/api/provider/provider.service";
import { branchService } from "@/api/branch/branch.service";
import { mailService } from "@/api/mail/mail.service";
import { patientService } from "@/api/patient/patient.service";

// Goals
// create encounter with different types and validate if data exist before creation eg is provider_id avaliable, is branch_id avaliable, is followup_id an actual encounter is they all exist then send a mail while cc in the branch in the email
// fetch the records for encounters
// fetch one record for encounter
// update encounter, details for the provider role or admin
// start encounter
// cancel encounter
// complete encounter
// get encounter status
// delete encounter admin or if provider check if it belong to the provider
// get metrics for patient total, completed, cancelled, inprogress, normal consultations, follow ups etc
// get metrics for provider total, completed, cancelled, inprogress, normal consultations, follow ups  etc and this can be narrowed down to branch as well
// get metrics for all for admin total, completed, cancelled, inprogress, normal consultations, follow ups  etc

export class EncounterService {
  constructor(
    public readonly encounterRepository = new EncounterRepository()
  ) {}

  async create(
    data: CreateEncounter,
    account: Account
  ): Promise<ServiceResponse<Encounter | null>> {
    try {
      const [provider, patient] = await Promise.all([
        providerService.providerRepository.findOne({
          where: { id: data.provider_id },
        }),
        patientService.patientRepository.findOne({
          where: {
            id: data.patient_id,
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

      if (!provider.available) {
        return ServiceResponse.failure(
          "Provider has been disabled",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      if (!patient) {
        return ServiceResponse.failure(
          "Patient Profile not found ",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Validate branch exists if provided
      let branch: Branch | null = null;
      if (data.branch_id) {
        branch = await branchService.branchRepository.findOne({
          where: { id: data.branch_id },
        });
        if (!branch) {
          return ServiceResponse.failure(
            "Branch not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (!branch.available) {
          return ServiceResponse.failure(
            "Branch has been disabled",
            null,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      // Validate follow-up encounter exists if provided
      if (data.follow_up_encounter_id) {
        const followUpEncounter = await this.encounterRepository.findOne({
          where: { id: data.follow_up_encounter_id },
        });
        if (!followUpEncounter) {
          return ServiceResponse.failure(
            "Follow-up encounter not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }
        if (data.encounter_type !== EncounterType.FOLLOW_UP) {
          return ServiceResponse.failure(
            "Encounter type must be follow up if there's a follow up id",
            null,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      // Create encounter
      const encounter = await this.encounterRepository.create({
        data: {
          ...data,
          provider_id: provider.id,
          patient_id: patient.id,
        },
      });

      // Send email notification fire and forget
      // mailService.sendMail({
      //   to: account.email,
      //   subject: `Encounter Scheduled - ${encounter.encounter_type}`,
      //   cc: branch?.email ? branch.email : undefined,
      //   html: `
      //       <h2>Encounter Scheduled</h2>
      //       <p>Dear ${patient.first_name},</p>
      //       <p>Your ${
      //         encounter.encounter_type
      //       } encounter has been scheduled for <strong>${encounter.scheduled_date.toDateString()}</strong>.</p>
      //       ${branch ? `<p>Location: <strong>${branch.name}</strong></p>` : ""}
      //       <p>Please arrive on time.</p>
      //     `,
      // });

      return ServiceResponse.success<Encounter>(
        "Encounter created successfully",
        encounter
      );
    } catch (error) {
      logger.error(`Error creating encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while creating encounter",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Encounter[]> | null>> {
    try {
      const paginatedOptions = {
        ...options,
        ...(options?.search
          ? {
              searchFields: options.searchFields ?? ["clinical_notes"],
            }
          : {}),
        include: {
          branch: true,
          provider: true,
          patient: true, // include related branches
          //  appointments: { include: { patient: true } }, // nested include
        },
      };
      const encounters = await this.encounterRepository.findPaginated(
        paginatedOptions
      );

      return ServiceResponse.success<PaginatedOptions<Encounter[]> | null>(
        "Encounters found",
        encounters
      );
    } catch (error) {
      logger.error(
        `Error fetching all encounters: ${(error as Error).message}`
      );

      return ServiceResponse.failure(
        "An error occurred while retrieving encounters",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Encounter | null>> {
    try {
      const encounter = await this.encounterRepository.findById(id);

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Encounter>("Encounter found", encounter);
    } catch (error) {
      logger.error(`Error fetching encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while finding encounter",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    data: UpdateEncounter,
    role: Role,
    account_id: string
  ): Promise<ServiceResponse<Encounter | null>> {
    try {
      const encounter = await this.encounterRepository.findOne({
        where: { id },
      });

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Role-based access: only admin or the provider who owns the encounter
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

        if (provider.id.toString() !== encounter.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      if (role === Role.Patient) {
        const patient = await patientService.patientRepository.findOne({
          where: { account_id },
        });

        if (!patient) {
          return ServiceResponse.failure(
            "Provider not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (patient.id.toString() !== encounter.patient_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      const updatedEncounter = await this.encounterRepository.update({
        where: { id: encounter.id },
        data,
      });

      return ServiceResponse.success<Encounter>(
        "Encounter updated successfully",
        updatedEncounter
      );
    } catch (error) {
      logger.error(`Error updating encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while updating encounter",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async startEncounter(
    id: string,
    role: Role,
    account_id: string
  ): Promise<ServiceResponse<Encounter | null>> {
    try {
      let encounter = await this.encounterRepository.findOne({
        where: { id },
      });

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const now = new Date();
      const scheduled = new Date(encounter.scheduled_date);

      if (scheduled > now) {
        return ServiceResponse.failure(
          "Cannot start encounter before scheduled date/time",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      if (
        ["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(encounter.status)
      ) {
        return ServiceResponse.failure(
          `Cannot start encounter with status '${encounter.status.toLowerCase()}'`,
          null,
          StatusCodes.BAD_REQUEST
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

        if (provider.id.toString() !== encounter.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      if (role === Role.Patient) {
        const patient = await patientService.patientRepository.findOne({
          where: { account_id },
        });

        if (!patient) {
          return ServiceResponse.failure(
            "Provider not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (patient.id.toString() !== encounter.patient_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      encounter = await this.encounterRepository.update({
        where: { id },
        data: {
          status: "IN_PROGRESS",
          actual_start_time: new Date(),
        },
      });

      return ServiceResponse.success<Encounter>("Encounter started", encounter);
    } catch (error) {
      logger.error(`Error starting encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while starting encounter",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async completeEncounter(
    id: string,
    role: Role,
    account_id: string
  ): Promise<ServiceResponse<Encounter | null>> {
    try {
      let encounter = await this.encounterRepository.findOne({
        where: { id },
      });

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (encounter.status !== EncounterStatus.IN_PROGRESS) {
        return ServiceResponse.failure(
          `Cannot complete encounter with status '${encounter.status.toLowerCase()}', only encounters in progress can be completed`,
          null,
          StatusCodes.BAD_REQUEST
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

        if (provider.id.toString() !== encounter.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      if (role === Role.Patient) {
        const patient = await patientService.patientRepository.findOne({
          where: { account_id },
        });

        if (!patient) {
          return ServiceResponse.failure(
            "Provider not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (patient.id.toString() !== encounter.patient_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      encounter = await this.encounterRepository.update({
        where: { id },
        data: {
          status: "COMPLETED" as EncounterStatus,
          actual_end_time: new Date(),
        },
      });

      return ServiceResponse.success<Encounter>(
        "Encounter completed",
        encounter
      );
    } catch (error) {
      logger.error(`Error completing encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while completing encounter",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelEncounter(
    id: string,
    role: Role,
    account_id: string
  ): Promise<ServiceResponse<Encounter | null>> {
    try {
      let encounter = await this.encounterRepository.findOne({
        where: { id },
      });

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (encounter.status === EncounterStatus.CANCELLED) {
        return ServiceResponse.failure(
          "Encounter has been cancelled",
          null,
          StatusCodes.BAD_REQUEST
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

        if (provider.id.toString() !== encounter.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      if (role === Role.Patient) {
        const patient = await patientService.patientRepository.findOne({
          where: { account_id },
        });

        if (!patient) {
          return ServiceResponse.failure(
            "Provider not found",
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (patient.id.toString() !== encounter.patient_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      encounter = await this.encounterRepository.update({
        where: { id },
        data: {
          status: "CANCELLED" as EncounterStatus,
        },
      });

      return ServiceResponse.success<Encounter>(
        "Encounter cancelled",
        encounter
      );
    } catch (error) {
      logger.error(`Error cancelling encounter: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while cancelling encounter",
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
      const encounter = await this.encounterRepository.findOne({
        where: { id },
      });

      if (!encounter) {
        return ServiceResponse.failure(
          "Encounter not found",
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

        if (provider.id.toString() !== encounter.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this encounter",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      await this.encounterRepository.delete({
        where: { id: encounter.id },
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

  async getMetrics(
    payload?: Metrics
  ): Promise<ServiceResponse<EncounterMetrics | null>> {
    try {
      const metrics = await this.encounterRepository.getMetrics(payload);
      return ServiceResponse.success<typeof metrics>(
        "Metrics retrieved successfully",
        metrics
      );
    } catch (error) {
      logger.error(`Error fetching metrics: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while fetching metrics",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const encounterService = new EncounterService();
