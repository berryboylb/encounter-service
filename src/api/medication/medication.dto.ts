import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const CreateMedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
  drug_form: z.string().optional(),
  quantity: z.number().optional(),
  patient_id: z.string(),
  provider_id: z.string(),
  encounter_id: z.string().optional(),
});

export type CreateMedication = z.infer<typeof CreateMedicationSchema>;

export const UpdateMedicationSchema = z.object({
  name: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  drug_form: z.string().optional(),
  quantity: z.number().optional(),
});

export type UpdateMedication = z.infer<typeof UpdateMedicationSchema>;

export const MedicationSchema = commonValidations.baseSchema.extend({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
  drug_form: z.string().optional(),
  quantity: z.number().optional(),
  tracking_id: z.string().optional(),
  patient_id: z.string(),
  provider_id: z.string(),
  encounter_id: z.string().optional(),
});

export const MedicationMetricsSchema = z.object({
  patient_id: commonValidations.id.optional(),
  provider_id: commonValidations.id.optional(),
});

export type MedicationMetrics = z.infer<typeof MedicationMetricsSchema>;
