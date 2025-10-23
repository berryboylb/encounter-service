import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class EncounterRepository extends BaseRepository<
  typeof prisma.encounter
> {
  constructor() {
    super(prisma, prisma.encounter);
  }
}
