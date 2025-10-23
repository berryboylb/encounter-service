import { StatusCodes } from "http-status-codes";
import { AccountRepository } from "@/api/account/account.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Account } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateAccount } from "../auth/auth.dto";
import { baseFilter, PaginatedOptions } from "../../types/express.types";

export class AccountService {
  constructor(public readonly accountRepository = new AccountRepository()) {}

  /**
   * Retrieves all accounts from the database
   */

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Account[]> | null>> {
    try {
      const accounts = await this.accountRepository.findPaginated(options ?? {});

      return ServiceResponse.success<PaginatedOptions<Account[]> | null>(
        "Accounts found",
        accounts
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

  /**
   * Retrieves a single account by its ID
   */
  async findById(id: string): Promise<ServiceResponse<Account | null>> {
    try {
      const account = await this.accountRepository.findById(id);

      if (!account) {
        return ServiceResponse.failure(
          "Account not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Account>("Account found", account);
    } catch (error) {
      logger.error(
        `Error finding account with ID ${id}: ${(error as Error).message}`
      );

      return ServiceResponse.failure(
        "An error occurred while finding account.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const account = await this.accountRepository.findByEmail(email);

      if (!account) {
        return ServiceResponse.failure(
          "Account not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Account>("Account found", account);
    } catch (error) {
      logger.error(
        `Error finding account with email ${email}: ${(error as Error).message}`
      );

      return ServiceResponse.failure(
        "An error occurred while finding account.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const accountService = new AccountService();
