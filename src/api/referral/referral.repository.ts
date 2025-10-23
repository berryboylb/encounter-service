import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class ReferralRepository extends BaseRepository<typeof prisma.referral> {
  constructor() {
    super(prisma, prisma.referral);
  }

  async getMetrics(provider_id?: string) {
    const where = provider_id ? { provider_id } : {};

    const [total, pending, approved, ongoing, rejected, completed] =
      await Promise.all([
        this.model.count({ where }),
        this.model.count({ where: { ...where, status: "Pending" } }),
        this.model.count({ where: { ...where, status: "Approved" } }),
        this.model.count({ where: { ...where, status: "Ongoing" } }),
        this.model.count({ where: { ...where, status: "Rejected" } }),
        this.model.count({ where: { ...where, status: "Completed" } }),
      ]);

    return { total, pending, approved, ongoing, rejected, completed };
  }
}
