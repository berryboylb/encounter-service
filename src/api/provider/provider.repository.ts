import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class ProviderRepository extends BaseRepository<typeof prisma.provider> {
  constructor() {
    super(prisma, prisma.provider);
  }

  public async getAllMetrics() {
    const results = (await this.prisma.$runCommandRaw({
      aggregate: "Provider",
      pipeline: [
        {
          $group: {
            _id: null,
            totalProviders: { $sum: 1 },
            availableProviders: {
              $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
            },
            providersWithName: {
              $sum: { $cond: [{ $ne: ["$name", null] }, 1, 0] },
            },
            providersWithContact: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $ne: ["$phone_number", null] },
                      { $ne: ["$whatsapp", null] },
                      { $ne: ["$hotline", null] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $project: { _id: 0 } },
      ],
      cursor: {},
    })) as {
      cursor?: {
        firstBatch?: Array<{
          totalProviders: number;
          availableProviders: number;
          providersWithName: number;
          providersWithContact: number;
          availablePercent?: number;
          profileCompletePercent?: number;
        }>;
      };
    };

    const metrics = results.cursor?.firstBatch?.[0] ?? {
      totalProviders: 0,
      availableProviders: 0,
      providersWithName: 0,
      providersWithContact: 0,
    };

    // calculate percentages
    metrics.availablePercent = metrics.totalProviders
      ? (metrics.availableProviders / metrics.totalProviders) * 100
      : 0;

    metrics.profileCompletePercent = metrics.totalProviders
      ? ((metrics.providersWithName + metrics.providersWithContact) /
          (metrics.totalProviders * 2)) *
        100
      : 0;

    return metrics;
  }
}
