import { z } from "zod";

export const createJobSchema = z.object({
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(10000, "Description must be under 10,000 characters"),
  location: z.string().max(200).optional(),
  experienceLevel: z
    .enum(["Entry", "Mid", "Senior", "Lead"])
    .optional(),
  candidateLimit: z
    .number()
    .int()
    .min(5, "Minimum 5 candidates")
    .max(50, "Maximum 50 candidates")
    .optional()
    .default(20),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
