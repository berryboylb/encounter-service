import { StatusCodes } from "http-status-codes";
import { TestRepository } from "@/api/test/test.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Test, Account, Role } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateTest, UpdateTest, TestMetrics, TestMetricsResults } from "./test.dto";
import { providerService } from "@/api/provider/provider.service";
import { baseFilter, PaginatedOptions } from "@/types/express.types";

export class TestService {
  constructor(public readonly testRepository = new TestRepository()) {}

  async create(data: CreateTest): Promise<ServiceResponse<Test | null>> {
    try {
      const test = await this.testRepository.create({ data });
      return ServiceResponse.success("Test created successfully", test);
    } catch (error) {
      logger.error(`Error creating test: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to create test",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Test | null>> {
    try {
      const test = await this.testRepository.findById(id);

      if (!test) {
        return ServiceResponse.failure(
          "Test not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success("Test found", test);
    } catch (error) {
      logger.error(`Error fetching test: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while finding test",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Test[]> | null>> {
    try {
      const tests = await this.testRepository.findPaginated(options ?? {});
      return ServiceResponse.success("Tests retrieved successfully", tests);
    } catch (error) {
      logger.error(`Error fetching tests: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while retrieving tests",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    data: UpdateTest,
    account?: Account
  ): Promise<ServiceResponse<Test | null>> {
    try {
      let test = await this.testRepository.findOne({ where: { id } });

      if (!test) {
        return ServiceResponse.failure(
          "Test not found",
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

        if (provider.id.toString() !== test.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this test",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      test = await this.testRepository.update({ where: { id }, data });
      return ServiceResponse.success("Test updated successfully", test);
    } catch (error) {
      logger.error(`Error updating test: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update test",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async approve(id: string): Promise<ServiceResponse<Test | null>> {
    try {
      const test = await this.testRepository.update({
        where: { id },
        data: { status: "Approved" },
      });
      return ServiceResponse.success("Test approved", test);
    } catch (error) {
      logger.error(`Error approving test: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to approve test",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async reject(id: string): Promise<ServiceResponse<Test | null>> {
    try {
      const test = await this.testRepository.update({
        where: { id },
        data: { status: "Rejected" },
      });
      return ServiceResponse.success("Test rejected", test);
    } catch (error) {
      logger.error(`Error rejecting test: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to reject test",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMetrics(
    payload?: TestMetrics
  ): Promise<ServiceResponse<TestMetricsResults | null>> {
    try {
      const metrics = await this.testRepository.getMetrics(payload);
      return ServiceResponse.success("Test metrics fetched", metrics);
    } catch (error) {
      logger.error(`Error fetching test metrics: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch test metrics",
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
      const test = await this.testRepository.findOne({ where: { id } });

      if (!test) {
        return ServiceResponse.failure(
          "Test not found",
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

        if (provider.id.toString() !== test.provider_id.toString()) {
          return ServiceResponse.failure(
            "You do not own this test",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      await this.testRepository.delete({ where: { id } });

      return ServiceResponse.success<true>("Test deleted successfully", true);
    } catch (error) {
      logger.error(`Error deleting test: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "An error occurred while deleting test",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const testService = new TestService();
