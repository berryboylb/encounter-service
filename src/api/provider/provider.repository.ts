import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class ProviderRepository extends BaseRepository<typeof prisma.provider> {
  constructor() {
    super(prisma, prisma.provider);
  }
}
