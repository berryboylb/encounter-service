import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class PatientRepository extends BaseRepository<typeof prisma.patient> {
  constructor() {
    super(prisma, prisma.patient);
  }
}