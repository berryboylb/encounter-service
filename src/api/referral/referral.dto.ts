import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const ReferralStatusEnum = z.enum([
  "Pending",
  "Approved",
  "Ongoing",
  "Rejected",
  "Completed",
]);

export const CreateReferralSchema = z.object({
  reason: z.string(),
  note: z.string().optional(),
  urgency: z.string().optional(),
  facility: z.string().optional(),
  patient_id: z.string(),
  provider_id: z.string(),
  encounter_id: z.string().optional(),
});

export type CreateReferral = z.infer<typeof CreateReferralSchema>;

export const UpdateReferralSchema = z.object({
  reason: z.string().optional(),
  note: z.string().optional(),
  urgency: z.string().optional(),
  facility: z.string().optional(),
});

export type UpdateReferral = z.infer<typeof UpdateReferralSchema>;

export const ReferralSchema = commonValidations.baseSchema.extend({
  reason: z.string(),
  note: z.string().optional(),
  urgency: z.string().optional(),
  tracking_id: z.string().optional(),
  facility: z.string().optional(),
  status: ReferralStatusEnum.optional().default("Pending"),
  patient_id: z.string(),
  provider_id: z.string(),
  encounter_id: z.string().optional(),
});

export const ReferralMetricsSchema = z.object({
  patient_id: commonValidations.id.optional(),
  provider_id: commonValidations.id.optional(),
});

export type ReferralMetrics = z.infer<typeof ReferralSchema>;

export const ReferralMetricResultsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  approved: z.number(),
  ongoing: z.number(),
  rejected: z.number(),
  completed: z.number(),
});

export type ReferralMetricsResults = z.infer<
  typeof ReferralMetricResultsSchema
>;
