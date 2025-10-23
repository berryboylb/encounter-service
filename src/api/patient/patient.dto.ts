import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { Account } from "@/generated/prisma";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const UpdatePatientSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.date().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  genotype: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
  phone_number: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bmi: z.number().optional(),
});

export type UpdatePatient = z.infer<typeof UpdatePatientSchema>;



export const PatientSchema = commonValidations.baseSchema.extend({
  account_id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.date().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  genotype: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
  phone_number: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bmi: z.number().optional(),
});