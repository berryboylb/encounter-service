import { ObjectId } from "mongodb";
import type { EncounterMetrics, Metrics } from "@/api/encounter/encounter.dto";
import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class EncounterRepository extends BaseRepository<typeof prisma.encounter> {
  constructor() {
    super(prisma, prisma.encounter);
  }

  // async getMetrics(payload?: Metrics): Promise<EncounterMetrics> {
  //   // 1️⃣ Build safe match filter
  //   const $match = Object.fromEntries(
  //     Object.entries(payload ?? {})
  //       .filter(([, value]) => value !== undefined && value !== null)
  //       .map(([key, value]) => [key, new ObjectId(value)])
  //   ) as Record<string, any>;

  //   // 2️⃣ Define reusable enums for cleaner structure
  //   const statuses = [
  //     "SCHEDULED",
  //     "IN_PROGRESS",
  //     "COMPLETED",
  //     "CANCELLED",
  //   ] as const;
  //   const encounterTypes = ["CONSULTATION", "FOLLOW_UP"] as const;

  //   // 3️⃣ Dynamically build $group
  //   const $group: Record<string, any> = { _id: null, total: { $sum: 1 } };

  //   for (const status of statuses) {
  //     $group[status.toLowerCase()] = {
  //       $sum: { $cond: [{ $eq: ["$status", status] }, 1, 0] },
  //     };
  //   }

  //   for (const type of encounterTypes) {
  //     $group[type.toLowerCase()] = {
  //       $sum: { $cond: [{ $eq: ["$encounter_type", type] }, 1, 0] },
  //     };
  //   }

  //   console.log("$match", $match);

  //   // 4️⃣ Run the aggregation with type assertion
  //   const result = (await prisma.$runCommandRaw({
  //     aggregate: "Encounter",
  //     pipeline: [
  //       {
  //         $match
  //       },
  //       { $group },
  //     ],
  //     cursor: {},
  //   })) as {
  //     cursor?: { firstBatch?: Array<EncounterMetrics> };
  //   };
  //   // 5️⃣ Always return a consistent result shape
  //   return (
  //     result.cursor?.firstBatch?.[0] ?? {
  //       total: 0,
  //       scheduled: 0,
  //       in_progress: 0,
  //       completed: 0,
  //       cancelled: 0,
  //       consultation: 0,
  //       follow_ups: 0,
  //     }
  //   );
  // }

  async getMetrics(payload?: Metrics): Promise<EncounterMetrics> {
    // 1️⃣ Build safe filter
    const filter: Record<string, any> = Object.fromEntries(
      Object.entries(payload ?? {}).filter(([, value]) => value != null)
    );

    // 2️⃣ Define enums
    const statuses = [
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ] as const;
    const encounterTypes = ["CONSULTATION", "FOLLOW_UP"] as const;

    // 3️⃣ Build promises for counts
    const totalPromise = prisma.encounter.count({ where: filter });

    const statusPromises = Object.fromEntries(
      statuses.map((status) => [
        status.toLowerCase(),
        prisma.encounter.count({ where: { ...filter, status } }),
      ])
    );

    const typePromises = Object.fromEntries(
      encounterTypes.map((type) => [
        type.toLowerCase(),
        prisma.encounter.count({ where: { ...filter, encounter_type: type } }),
      ])
    );

    // 4️⃣ Execute all promises
    const [total, ...counts] = await Promise.all([
      totalPromise,
      ...Object.values(statusPromises),
      ...Object.values(typePromises),
    ]);

    const metrics: EncounterMetrics = {
      total,
      scheduled: counts[0],
      in_progress: counts[1],
      completed: counts[2],
      cancelled: counts[3],
      consultation: counts[4],
      follow_ups: counts[5],
    };

    return metrics;
  }
}
