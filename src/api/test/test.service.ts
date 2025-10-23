import { StatusCodes } from "http-status-codes";
import { TestRepository } from "@/api/test/test.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Test } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateTest, UpdateTest } from "./test.dto";

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

  async update(
    id: string,
    data: UpdateTest
  ): Promise<ServiceResponse<Test | null>> {
    try {
      const test = await this.testRepository.update({ where: { id }, data });
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

  async getMetrics(provider_id?: string): Promise<ServiceResponse<any>> {
    try {
      const metrics = await this.testRepository.getMetrics(provider_id);
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
}

export const testService = new TestService();
