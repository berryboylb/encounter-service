import { StatusCodes } from "http-status-codes";
import { ReferralRepository } from "@/api/referral/referral.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Referral } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateReferral, UpdateReferral } from "./referral.dto";

export class ReferralService {
  constructor(public readonly referralRepository = new ReferralRepository()) {}

  async create(
    data: CreateReferral
  ): Promise<ServiceResponse<Referral | null>> {
    try {
      const referral = await this.referralRepository.create({ data });
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

  async update(
    id: string,
    data: UpdateReferral
  ): Promise<ServiceResponse<Referral | null>> {
    try {
      const referral = await this.referralRepository.update({
        where: { id },
        data,
      });
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

  async getMetrics(provider_id?: string): Promise<ServiceResponse<any>> {
    try {
      const metrics = await this.referralRepository.getMetrics(provider_id);
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
}

export const referralService = new ReferralService();
