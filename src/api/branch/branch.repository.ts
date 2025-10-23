import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class BranchRepository extends BaseRepository<typeof prisma.branch> {
  constructor() {
    super(prisma, prisma.branch);
  }
}