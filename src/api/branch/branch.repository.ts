import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class BranchRepository extends BaseRepository<typeof prisma.branch> {
  constructor() {
    super(prisma, prisma.branch);
  }

  async metrics(provider_id?: string) {
    const matchStage = provider_id ? { provider_id } : {};
    const result = (await prisma.$runCommandRaw({
      aggregate: "Branch",
      pipeline: [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ["$available", true] }, 1, 0],
              },
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ["$available", false] }, 1, 0],
              },
            },
          },
        },
      ],
      cursor: {},
    })) as {
      cursor?: {
        firstBatch?: Array<{ total: number; active: number; inactive: number }>;
      };
    };

    return (
      result.cursor?.firstBatch?.[0] ?? {
        total: 0,
        active: 0,
        inactive: 0,
      }
    );
  }
}
