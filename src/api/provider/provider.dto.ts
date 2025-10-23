import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { Account } from "@/generated/prisma";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const UpdateProviderSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  type: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
  hotline: z.string().optional(),
});

export type UpdateProvider = z.infer<typeof UpdateProviderSchema>;



export const ProviderSchema = commonValidations.baseSchema.extend({
  account_id: z.string(),
  name: z.string().optional(),
  image: z.string().optional(),
  type: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
  hotline: z.string().optional(),
  available: z.boolean().optional().default(true),
});


export interface ProviderMetrics {
  provider_id: string;
  available: boolean;
  name_present: boolean;
  contact_complete: boolean;
  type_defined: boolean;
  profile_complete_percent: number;
  days_active: number;
  last_updated_days_ago: number;
}