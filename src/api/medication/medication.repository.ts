import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class MedicationRepository extends BaseRepository<
  typeof prisma.medication
> {
  constructor() {
    super(prisma, prisma.medication);
  }

  async getMetrics() {
    // do something
  }
}
