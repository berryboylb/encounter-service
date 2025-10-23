import { BaseRepository } from "@/common/utils/common.service";
import { prisma } from "@/prisma.client";

export class AccountRepository extends BaseRepository<typeof prisma.account> {
  constructor() {
    super(prisma, prisma.account);
  }

  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } });
  }

  async findByOtp(otp: string) {
    return this.model.findFirst({ where: { otp } });
  }
}
