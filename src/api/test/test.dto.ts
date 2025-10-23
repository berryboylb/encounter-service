import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const TestStatusEnum = z.enum(["Pending", "Ongoing", "Completed"]);

export const CreateTestSchema = z.object({
  name: z.string(),
  note: z.string().optional(),
  urgency: z.string().optional(),
  tat: z.string().optional(),
  tracking_id: z.string().optional(),
  facility: z.string().optional(),
  status: TestStatusEnum.optional().default("Pending"),
  patient_id: z.string(),
  provider_id: z.string(),
  encounter_id: z.string().optional(),
});

export type CreateTest = z.infer<typeof CreateTestSchema>;

export const UpdateTestSchema = z.object({
  name: z.string().optional(),
  note: z.string().optional(),
  urgency: z.string().optional(),
  tat: z.string().optional(),
  tracking_id: z.string().optional(),
  facility: z.string().optional(),
  status: TestStatusEnum.optional(),
  patient_id: z.string().optional(),
  provider_id: z.string().optional(),
  encounter_id: z.string().optional(),
});

export type UpdateTest = z.infer<typeof UpdateTestSchema>;

export const TestSchema = commonValidations.baseSchema.extend({
  name: z.string(),
  note: z.string().optional(),
  urgency: z.string().optional(),
  tat: z.string().optional(),
  tracking_id: z.string().optional(),
  facility: z.string().optional(),
  status: TestStatusEnum.optional().default("Pending"),
  patient_id: z.string(),
  provider_id: z.string(),
  encounter_id: z.string().optional(),
});
