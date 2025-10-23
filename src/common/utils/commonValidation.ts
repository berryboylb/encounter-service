import { z } from "zod";

export const commonValidations = {
  id: z.string(),
  // .refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
  // .transform(Number)
  // .refine((num) => num > 0, "ID must be a positive number"),
  // ... other common validations
  baseSchema: z.object({
    id: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
  }),
  query: z
    .object({
      page: z.number().int().positive().optional().default(1), // default to 1
      pageSize: z.number().int().positive().optional().default(10), // default to 10
      search: z.string().optional(),
      filterBy: z
        .record(z.any()) // Partial<T> equivalent at runtime
        .optional()
        .default({}),
      orderBy: z.string().optional(), // e.g., "-created_at"
      searchFields: z.array(z.string()).optional().default([]), // array of keys of T
    })
    .optional(),

  params: z.object({ id: z.string() }),
};
