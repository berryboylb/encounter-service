import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";
import {
  ReferralMetrics,
  ReferralMetricsResults,
} from "@/api/referral/referral.dto";

export class ReferralRepository extends BaseRepository<typeof prisma.referral> {
  constructor() {
    super(prisma, prisma.referral);
  }

  async getMetrics(payload?: ReferralMetrics): Promise<ReferralMetricsResults> {
    const match: Record<string, any> = {};

    if (payload?.patient_id) {
      match.patient_id = payload.patient_id;
    }
    if (payload?.provider_id) {
      match.provider_id = payload.provider_id;
    }

    const results = (await this.prisma.$runCommandRaw({
      aggregate: "Referral",
      pipeline: [
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
            },
            ongoing: {
              $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
            },
          },
        },
        { $project: { _id: 0 } },
      ],
      cursor: {},
    })) as { cursor?: { firstBatch?: Array<ReferralMetricsResults> } };

    return (
      results.cursor?.firstBatch?.[0] ?? {
        total: 0,
        pending: 0,
        approved: 0,
        ongoing: 0,
        rejected: 0,
        completed: 0,
      }
    );
  }
}
