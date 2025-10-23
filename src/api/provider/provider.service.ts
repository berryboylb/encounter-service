import { StatusCodes } from "http-status-codes";
import { ProviderRepository } from "@/api/provider/provider.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Provider } from "@/generated/prisma";
import { logger } from "@/server";
import { CreateAccount } from "../auth/auth.dto";
import { UpdateProvider, ProviderMetrics } from "@/api/provider/provider.dto";
import { baseFilter, PaginatedOptions } from "@/types/express.types";

export class ProviderService {
  constructor(public readonly providerRepository = new ProviderRepository()) {}

  private calculateMetrics(provider: Provider): ProviderMetrics {
    const contactFields = ["phone_number", "whatsapp", "hotline"];
    const profileFields = [
      "name",
      "image",
      "type",
      "phone_number",
      "address",
      "whatsapp",
      "hotline",
    ];

    const contact_complete = contactFields.some(
      (field) => !!provider[field as keyof typeof provider]
    );
    const filledFieldsCount = profileFields.filter(
      (field) => !!provider[field as keyof typeof provider]
    ).length;
    const profile_complete_percent = Math.round(
      (filledFieldsCount / profileFields.length) * 100
    );

    const now = new Date();
    const days_active = Math.floor(
      (now.getTime() - provider.created_at.getTime()) / (1000 * 60 * 60 * 24)
    );
    const last_updated_days_ago = Math.floor(
      (now.getTime() - provider.updated_at.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      provider_id: provider.id,
      available: !!provider.available,
      name_present: !!provider.name,
      contact_complete,
      type_defined: !!provider.type,
      profile_complete_percent,
      days_active,
      last_updated_days_ago,
    };
  }

  // ✅ Single provider metrics
  public async getMetric(
    providerId: string
  ): Promise<ServiceResponse<ProviderMetrics | null>> {
    try {
      const provider = await this.providerRepository.findById(providerId);
      if (!provider) {
        return ServiceResponse.failure(
          "Provider not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const metrics = this.calculateMetrics(provider);
      return ServiceResponse.success("Provider metrics retrieved", metrics);
    } catch (error) {
      logger.error(
        `Error fetching provider metrics: ${(error as Error).message}`
      );
      return ServiceResponse.failure(
        "An error occurred while retrieving provider metrics.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // provider.metrics.service.ts

  public async getAllMetrics(): Promise<ServiceResponse<any>> {
    try {
      // const [
      //   totalProviders,
      //   availableProviders,
      //   providersWithName,
      //   providersWithContact,
      // ] = await Promise.all([
      //   this.providerRepository.count({}),
      //   this.providerRepository.count({ where: { available: true } }),
      //   this.providerRepository.count({ where: { NOT: { name: null } } }),
      //   this.providerRepository.count({
      //     where: {
      //       OR: [
      //         { phone_number: { not: null } },
      //         { whatsapp: { not: null } },
      //         { hotline: { not: null } },
      //       ],
      //     },
      //   }),
      // ]);

      // const metrics = {
      //   totalProviders,
      //   availableProviders,
      //   providersWithName,
      //   providersWithContact,
      //   availablePercent: totalProviders
      //     ? (availableProviders / totalProviders) * 100
      //     : 0,
      //   profileCompletePercent: totalProviders
      //     ? ((providersWithName + providersWithContact) /
      //         (totalProviders * 2)) *
      //       100
      //     : 0,
      // };
      const metrics = await this.providerRepository.getAllMetrics();
      return ServiceResponse.success(
        "Aggregated provider metrics retrieved",
        metrics
      );
    } catch (error) {
      logger.error(
        `Error fetching aggregated provider metrics: ${
          (error as Error).message
        }`
      );
      return ServiceResponse.failure(
        "An error occurred while retrieving provider metrics.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(
    options: baseFilter
  ): Promise<ServiceResponse<PaginatedOptions<Provider[]> | null>> {
    try {
      const paginatedOptions = {
        ...options,
        ...(options?.search
          ? {
              searchFields: options.searchFields ?? [
                "name",
                "address",
                "phone_number",
                "whatsapp",
                "hotline",
              ],
            }
          : {}),
      };
      const accounts = await this.providerRepository.findPaginated(
        paginatedOptions
      );

      return ServiceResponse.success<PaginatedOptions<Provider[]> | null>(
        "Providers found",
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

  async findOne(id: string): Promise<ServiceResponse<Provider | null>> {
    try {
      const provider = await this.providerRepository.findById(id);
      if (!provider)
        return ServiceResponse.failure(
          `Provider not found`,
          null,
          StatusCodes.NOT_FOUND
        );

      return ServiceResponse.success<Provider>("Provider found", provider);
    } catch (error) {
      logger.error(`Error fetching provider ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while retrieving accounts.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string) {
    try {
      // First, check if the provider exists
      const existingProvider = await this.providerRepository.findOne({
        where: { OR: [{ id }, { account_id: id }] },
      });

      if (!existingProvider) {
        return ServiceResponse.failure(
          "Provider not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Delete the provider
      await this.providerRepository.delete({
        where: { id: existingProvider.id },
      });

      return ServiceResponse.success<true>(
        "Provider deleted successfully",
        true
      );
    } catch (error) {
      logger.error(`Error deleting provider: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while deleting the provider.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findProfile(id: string): Promise<ServiceResponse<Provider | null>> {
    try {
      const provider = await this.providerRepository.findOne({
        where: {
          account_id: id,
        },
      });

      if (!provider) {
        return ServiceResponse.failure(
          "No provider profile found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Provider>("Provider found", provider);
    } catch (error) {
      logger.error(`Error fetching provider: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while retrieving Provider.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateProfile(
    id: string,
    data: UpdateProvider
  ): Promise<ServiceResponse<Provider | null>> {
    try {
      const provider = await this.providerRepository.upsert({
        where: {
          id,
        },
        update: data,
        create: { account_id: id, ...data },
      });

      if (!provider) {
        return ServiceResponse.failure(
          "No provider profile found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<Provider>("Provider Updated", provider);
    } catch (error) {
      logger.error(`Error fetching provider: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while retrieving accounts.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async toggleAvailability(
    id: string
  ): Promise<ServiceResponse<Provider | null>> {
    try {
      let provider = await this.providerRepository.findOne({
        where: {
          account_id: id,
        },
      });

      if (!provider) {
        return ServiceResponse.failure(
          "No provider profile found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      provider = await this.providerRepository.update({
        where: {
          id,
        },
        data: {
          available: !provider.available,
        },
      });

      return ServiceResponse.success<Provider>("Provider Updated", provider);
    } catch (error) {
      logger.error(`Error fetching provider: ${(error as Error).message}`);

      return ServiceResponse.failure(
        "An error occurred while retrieving accounts.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const providerService = new ProviderService();
