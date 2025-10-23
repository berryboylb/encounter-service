import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const TestStatusEnum = z.enum(["Pending", "Approved", "Rejected"]);

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

export const TestMetricsSchema = z.object({
  patient_id: commonValidations.id.optional(),
  provider_id: commonValidations.id.optional(),
});

export type TestMetrics = z.infer<typeof TestMetricsSchema>;

export const TestMetricResultsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
});

export type TestMetricsResults = z.infer<typeof TestMetricResultsSchema>;
