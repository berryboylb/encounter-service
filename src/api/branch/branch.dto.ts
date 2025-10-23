import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {Branch  } from "@/generated/prisma";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const CreateBranchSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  hotline: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

export type CreateBranch = z.infer<typeof CreateBranchSchema>;

export const UpdateBranchSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  hotline: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateBranch = z.infer<typeof UpdateBranchSchema>;

export const BranchSchema = commonValidations.baseSchema.extend({
  name: z.string(),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  hotline: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});