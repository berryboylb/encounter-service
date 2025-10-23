import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class TestRepository extends BaseRepository<typeof prisma.test> {
  constructor() {
    super(prisma, prisma.test);
  }

  async getMetrics(provider_id?: string) {
    // would do something
  }
}
