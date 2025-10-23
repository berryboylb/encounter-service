import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";
import { Metrics, EncounterMetrics } from "@/api/encounter/encounter.dto";

export class EncounterRepository extends BaseRepository<typeof prisma.encounter> {
  constructor() {
    super(prisma, prisma.encounter);
  }

  async getMetrics(payload?: Metrics): Promise<EncounterMetrics> {
    // 1️⃣ Build safe match filter
    const $match = Object.fromEntries(
      Object.entries(payload ?? {}).filter(
        ([, value]) => value !== undefined && value !== null
      )
    ) as Record<string, string>;

    // 2️⃣ Define reusable enums for cleaner structure
    const statuses = [
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ] as const;
    const encounterTypes = ["CONSULTATION", "FOLLOW_UP"] as const;

    // 3️⃣ Dynamically build $group
    const $group: Record<string, any> = { _id: null, total: { $sum: 1 } };

    for (const status of statuses) {
      $group[status.toLowerCase()] = {
        $sum: { $cond: [{ $eq: ["$status", status] }, 1, 0] },
      };
    }

    for (const type of encounterTypes) {
      $group[type.toLowerCase()] = {
        $sum: { $cond: [{ $eq: ["$encounter_type", type] }, 1, 0] },
      };
    }

    // 4️⃣ Run the aggregation with type assertion
    const result = (await prisma.$runCommandRaw({
      aggregate: "Encounter",
      pipeline: [{ $match }, { $group }],
      cursor: {},
    })) as {
      cursor?: { firstBatch?: Array<EncounterMetrics> };
    };

    // 5️⃣ Always return a consistent result shape
    return (
      result.cursor?.firstBatch?.[0] ?? {
        total: 0,
        scheduled: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        consultation: 0,
        follow_ups: 0,
      }
    );
  }
}
