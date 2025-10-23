import { StatusCodes } from "http-status-codes";
import { BranchRepository } from "@/api/branch/branch.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Branch, Role } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateBranch, UpdateBranch } from "../branch/branch.dto";
import { baseFilter, PaginatedOptions } from "@/types/express.types";
import { providerService } from "@/api/provider/provider.service";

export class BranchService {
  constructor(public readonly branchRepository = new BranchRepository()) {}

  async create(
    account_id: string,
    data: CreateBranch
  ): Promise<ServiceResponse<Branch | null>> {
    try {
      const provider = await providerService.providerRepository.findOne({
        where: { account_id },
      });

      if (!provider) {
        return ServiceResponse.failure(
          `Provider not found`,
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const branch = await this.branchRepository.create({
        data: { ...data, provider_id: provider.id },
      });

      return ServiceResponse.success<Branch>("Branch Created", branch);
    } catch (error) {
      logger.error(`Error fetching provider: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while creating branch",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Branch[]> | null>> {
    try {
      const branches = await this.branchRepository.findPaginated(options ?? {});

      return ServiceResponse.success<PaginatedOptions<Branch[]> | null>(
        "Accounts found",
        branches
      );
    } catch (error) {
      logger.error(`Error fetching all accounts: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while retrieving accounts.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Branch | null>> {
    try {
      const branch = await this.branchRepository.findById(id);
      if (!branch)
        return ServiceResponse.failure(
          `Branch not found`,
          null,
          StatusCodes.NOT_FOUND
        );

      return ServiceResponse.success<Branch>("Branch found", branch);
    } catch (error) {
      logger.error(`Error fetching provider ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while  finding branch.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string, role: Role, account_id: string) {
    try {
      // First, check if the provider exists
      const branch = await this.branchRepository.findOne({
        where: { id },
      });

      if (!branch) {
        return ServiceResponse.failure(
          "branch not found",
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
            `Provider not found`,
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (provider.id.toString() !== branch.provider_id.toString())
          return ServiceResponse.failure(
            "You do not own this branch",
            null,
            StatusCodes.FORBIDDEN
          );
      }

      // Delete the provider
      await this.branchRepository.delete({
        where: { id: branch.id },
      });

      return ServiceResponse.success<true>("Branch deleted successfully", true);
    } catch (error) {
      logger.error(`Error deleting Branch: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while deleting the branch.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, data: UpdateBranch, role: Role, account_id: string) {
    try {
      // First, check if the provider exists
      let branch = await this.branchRepository.findOne({
        where: { id },
      });

      if (!branch) {
        return ServiceResponse.failure(
          "branch not found",
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
            `Provider not found`,
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (provider.id.toString() !== branch.provider_id.toString())
          return ServiceResponse.failure(
            "You do not own this branch",
            null,
            StatusCodes.FORBIDDEN
          );
      }

      branch = await this.branchRepository.update({
        where: { id: branch.id },
        data,
      });

      return ServiceResponse.success<true>("Branch updated successfully", true);
    } catch (error) {
      logger.error(`Error updating Branch: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while updating the branch.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async toggleAvailability(
    id: string,
    role: Role,
    account_id: string
  ): Promise<ServiceResponse<Branch | null>> {
    try {
      let branch = await this.branchRepository.findOne({
        where: {
          id,
        },
      });

      if (!branch) {
        return ServiceResponse.failure(
          "No branch found",
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
            `Provider not found`,
            null,
            StatusCodes.NOT_FOUND
          );
        }

        if (provider.id.toString() !== branch.provider_id.toString())
          return ServiceResponse.failure(
            "You do not own this branch",
            null,
            StatusCodes.FORBIDDEN
          );
      }

      branch = await this.branchRepository.update({
        where: {
          id,
        },
        data: {
          available: !branch.available,
        },
      });

      return ServiceResponse.success<Branch>("Branch Updated", branch);
    } catch (error) {
      logger.error(`Error fetching Branch: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while retrieving accounts.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async metrics(provider_id?: string): Promise<
    ServiceResponse<{
      total: number;
      active: number;
      inactive: number;
    } | null>
  > {
    try {
      const metrics = await this.branchRepository.metrics(provider_id);
      return ServiceResponse.success<{
        total: number;
        active: number;
        inactive: number;
      }>("Branch Updated", metrics);
    } catch (error) {
      logger.error(`Error fetching Branch: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while fetching metrics.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const branchService = new BranchService();
