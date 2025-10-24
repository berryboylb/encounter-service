import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";
import { TestMetrics, TestMetricsResults } from "@/api/test/test.dto";

export class TestRepository extends BaseRepository<typeof prisma.test> {
  constructor() {
    super(prisma, prisma.test);
  }

  // async getMetrics(payload?: TestMetrics): Promise<TestMetricsResults> {
  //   const match: Record<string, any> = {};

  //   if (payload?.patient_id) {
  //     match.patient_id = payload.patient_id;
  //   }
  //   if (payload?.provider_id) {
  //     match.provider_id = payload.provider_id;
  //   }

  //   const results = (await this.prisma.$runCommandRaw({
  //     aggregate: "Test",
  //     pipeline: [
  //       { $match: match },
  //       {
  //         $group: {
  //           _id: null,
  //           total: { $sum: 1 },
  //           pending: {
  //             $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
  //           },
  //           approved: {
  //             $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
  //           },
  //           rejected: {
  //             $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
  //           },
  //         },
  //       },
  //       { $project: { _id: 0 } },
  //     ],
  //     cursor: {},
  //   })) as {
  //     cursor?: { firstBatch?: Array<TestMetricsResults> };
  //   };

  //   const metrics = results.cursor?.firstBatch?.[0] ?? {
  //     total: 0,
  //     pending: 0,
  //     approved: 0,
  //     rejected: 0,
  //   };

  //   return metrics;
  // }

  async getMetrics(payload?: TestMetrics): Promise<TestMetricsResults> {
    const match: Record<string, any> = {};

    if (payload?.patient_id) match.patient_id = payload.patient_id;
    if (payload?.provider_id) match.provider_id = payload.provider_id;

    // Count total and by status in parallel
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.test.count({ where: match }),
      this.prisma.test.count({ where: { ...match, status: "Pending" } }),
      this.prisma.test.count({ where: { ...match, status: "Approved" } }),
      this.prisma.test.count({ where: { ...match, status: "Rejected" } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
