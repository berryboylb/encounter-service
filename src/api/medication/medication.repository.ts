import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";
import { MedicationMetrics } from "@/api/medication/medication.dto";

export class MedicationRepository extends BaseRepository<
  typeof prisma.medication
> {
  constructor() {
    super(prisma, prisma.medication);
  }

  async getMetrics(payload: MedicationMetrics): Promise<number> {
    const where: any = {};

    if (payload.patient_id) {
      where.patient_id = payload.patient_id;
    }
    if (payload.provider_id) {
      where.provider_id = payload.provider_id;
    }

    // Prisma count is efficient and correct for this model
    const total = await this.model.count({ where });
    return total;
  }
}
