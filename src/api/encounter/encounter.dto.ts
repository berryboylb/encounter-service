import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// ------------------ Enums ------------------ //
export const EncounterTypeEnum = z.enum(["CONSULTATION", "FOLLOW_UP"]);

export const EncounterStatusEnum = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// ------------------ Nested Schemas ------------------ //
export const AssessmentSchema = z.object({
  primary_diagnosis: z.string().optional(),
  secondary_diagnosis: z.array(z.string()).default([]),
  differential_diagnosis: z.array(z.string()).default([]),
  clinical_impression: z.string().optional(),
});

export const VitalSignSchema = z.object({
  blood_pressure: z.string().optional(),
  heart_rate: z.number().optional(),
  temperature: z.number().optional(),
  respiratory_rate: z.number().optional(),
  oxygen_saturation: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bmi: z.number().optional(),
});

export const ObjectiveSchema = z.object({
  vital_signs: VitalSignSchema.optional(),
  physical_examination: z.string().optional(),
  laboratory_results: z.string().optional(),
  diagnostic_tests: z.string().optional(),
});

export const SubjectiveSchema = z.object({
  chief_complaint: z.string().optional(),
  history_of_present_illness: z.string().optional(),
  review_of_systems: z.string().optional(),
  social_history: z.string().optional(),
  family_history: z.string().optional(),
});

// ------------------ Main Encounter Schema ------------------ //
export const CreateEncounterSchema = z.object({
  patient_id: z.string(),
  provider_id: z.string(),
  branch_id: z.string().optional(),
  encounter_type: EncounterTypeEnum,
  scheduled_date: z.coerce.date(),
  symptoms: z.array(z.string()).default([]),

  subjective: SubjectiveSchema.optional(),
  objective: ObjectiveSchema.optional(),
  assessment: AssessmentSchema.optional(),

  clinical_notes: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
  follow_up_encounter_id: z.string().optional(),
});

export type CreateEncounter = z.infer<typeof CreateEncounterSchema>;

// ------------------ Update Schema ------------------ //
export const UpdateEncounterSchema = z.object({
  scheduled_date: z.coerce.date().optional(),
  symptoms: z.array(z.string()).optional(),

  subjective: SubjectiveSchema.optional(),
  objective: ObjectiveSchema.optional(),
  assessment: AssessmentSchema.optional(),

  clinical_notes: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
});

export type UpdateEncounter = z.infer<typeof UpdateEncounterSchema>;

// ------------------ Full Encounter Schema (DB Schema) ------------------ //
export const EncounterSchema = commonValidations.baseSchema.extend({
  patient_id: z.string(),
  provider_id: z.string(),
  branch_id: z.string().optional(),
  encounter_type: EncounterTypeEnum,
  status: EncounterStatusEnum,
  scheduled_date: z.coerce.date(),
  actual_start_time: z.coerce.date().optional(),
  actual_end_time: z.coerce.date().optional(),
  symptoms: z.array(z.string()).default([]),

  subjective: SubjectiveSchema.optional(),
  objective: ObjectiveSchema.optional(),
  assessment: AssessmentSchema.optional(),

  clinical_notes: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
});

export type Encounter = z.infer<typeof EncounterSchema>;

export const MetricsSchema = z.object({
  patient_id: commonValidations.id.optional(),
  provider_id: commonValidations.id.optional(),
  branch_id: commonValidations.id.optional(),
});

export type Metrics = z.infer<typeof MetricsSchema>;




export const EncounterMetricsSchema = z.object({
  total: z.number(),
  scheduled: z.number(),
  in_progress: z.number(),
  completed: z.number(),
  cancelled: z.number(),
  consultation: z.number(),
  follow_ups: z.number(),
});

export type EncounterMetrics = z.infer<typeof EncounterMetricsSchema>;

export const CancelEncounterSchema = z.object({
  reason: z.string().optional(),
});

export type CancelEncounterDto = z.infer<typeof CancelEncounterSchema>;

export const RescheduleEncounterSchema = z.object({
  date: z.coerce.date(),
  reason: z.string().optional(),
});

export type RescheduleEncounterDto = z.infer<typeof RescheduleEncounterSchema>;
