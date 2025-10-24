import { StatusCodes } from "http-status-codes";
import { ReferralRepository } from "@/api/referral/referral.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Referral, Account, Role } from "@/generated/prisma";
import { logger } from "@/server";
import {
  CreateReferral,
  UpdateReferral,
  ReferralMetrics,
  ReferralMetricsResults,
} from "./referral.dto";
import { providerService } from "@/api/provider/provider.service";
import { baseFilter, PaginatedOptions } from "@/types/express.types";
import { patientService } from "@/api/patient/patient.service";
import { encounterService } from "@/api/encounter/encounter.service";
import { generateTrackingId } from "@/common/utils/tracking";

export class ReferralService {
  constructor(public readonly referralRepository = new ReferralRepository()) {}

  async create(
    data: CreateReferral
  ): Promise<ServiceResponse<Referral | null>> {
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
      const referral = await this.referralRepository.create({
        data: {
          ...data,
          tracking_id: generateTrackingId(),
        },
      });
      return ServiceResponse.success("Referral created successfully", referral);
    } catch (error) {
      logger.error(`Error creating referral: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to create referral",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Referral | null>> {
    try {
      const referral = await this.referralRepository.findById(id, {
        include: { encounter: true, provider: true, patient: true },
      });

      if (!referral) {
        return ServiceResponse.failure(
          "Referral not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success("Referral found", referral);
    } catch (error) {
      logger.error(`Error fetching referral: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while finding referral",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Referral[]> | null>> {
    try {
      const paginatedOptions = {
        ...options,
        ...(options?.search
          ? {
              searchFields: options.searchFields ?? [
                "reason",
                "note",
                "urgency",
                "tracking_id",
                "facility",
              ],
            }
          : {}),
        include: {
          encounter: true,
          provider: true,
          patient: true,
        },
      };
      const referrals = await this.referralRepository.findPaginated(
        paginatedOptions
      );
      return ServiceResponse.success(
        "Referrals retrieved successfully",
        referrals
      );
    } catch (error) {
      logger.error(`Error fetching referrals: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while retrieving referrals",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    data: UpdateReferral,
    account?: Account
  ): Promise<ServiceResponse<Referral | null>> {
    try {
      let referral = await this.referralRepository.findOne({ where: { id } });

      if (!referral) {
        return ServiceResponse.failure(
          "Referral not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Optional ownership check for Providers
      if (account?.role === Role.Provider) {
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

        if (provider.id.toString() !== referral.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this referral",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      referral = await this.referralRepository.update({ where: { id }, data });
      return ServiceResponse.success("Referral updated successfully", referral);
    } catch (error) {
      logger.error(`Error updating referral: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update referral",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async approve(id: string): Promise<ServiceResponse<Referral | null>> {
    try {
      // 1️⃣ Fetch the referral first
      const referral = await this.referralRepository.findById(id);

      if (!referral) {
        return ServiceResponse.failure(
          "Referral not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // 2️⃣ Update only if it exists
      const updated = await this.referralRepository.update({
        where: { id },
        data: { status: "Approved" },
      });

      return ServiceResponse.success("Referral approved", updated);
    } catch (error) {
      logger.error(`Error approving referral: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to approve referral",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async reject(id: string): Promise<ServiceResponse<Referral | null>> {
    try {
      const referral = await this.referralRepository.findById(id);

      if (!referral) {
        return ServiceResponse.failure(
          "Referral not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const updated = await this.referralRepository.update({
        where: { id },
        data: { status: "Rejected" },
      });

      return ServiceResponse.success("Referral rejected", updated);
    } catch (error) {
      logger.error(`Error rejecting referral: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to reject referral",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async markOngoing(id: string): Promise<ServiceResponse<Referral | null>> {
  //   try {
  //     const referral = await this.referralRepository.update({
  //       where: { id },
  //       data: { status: "Ongoing" },
  //     });
  //     return ServiceResponse.success("Referral marked as ongoing", referral);
  //   } catch (error) {
  //     logger.error(
  //       `Error marking referral as ongoing: ${(error as Error).message}`
  //     );
  //     return ServiceResponse.failure(
  //       "Failed to mark referral as ongoing",
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  // async complete(id: string): Promise<ServiceResponse<Referral | null>> {
  //   try {
  //     const referral = await this.referralRepository.update({
  //       where: { id },
  //       data: { status: "Completed" },
  //     });
  //     return ServiceResponse.success("Referral marked as completed", referral);
  //   } catch (error) {
  //     logger.error(`Error completing referral: ${(error as Error).message}`);
  //     return ServiceResponse.failure(
  //       "Failed to complete referral",
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  async getMetrics(
    payload?: ReferralMetrics
  ): Promise<ServiceResponse<ReferralMetricsResults | null>> {
    try {
      const metrics = await this.referralRepository.getMetrics(payload);
      return ServiceResponse.success("Referral metrics fetched", metrics);
    } catch (error) {
      logger.error(
        `Error fetching referral metrics: ${(error as Error).message}`
      );
      return ServiceResponse.failure(
        "Failed to fetch referral metrics",
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
      const referral = await this.referralRepository.findOne({ where: { id } });

      if (!referral) {
        return ServiceResponse.failure(
          "Referral not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Ownership check for Providers
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

        if (provider.id.toString() !== referral.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this referral",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      await this.referralRepository.delete({ where: { id } });
      return ServiceResponse.success<true>(
        "Referral deleted successfully",
        true
      );
    } catch (error) {
      logger.error(`Error deleting referral: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while deleting referral",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const referralService = new ReferralService();
