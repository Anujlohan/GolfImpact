import { z } from 'zod';

export const scoreInputSchema = z.object({
  score: z
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be an integer')
    .min(1, 'Score must be between 1 and 45')
    .max(45, 'Score must be between 1 and 45'),
  scoreDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
});

export const updateScoreSchema = scoreInputSchema.extend({
  id: z.string().uuid('Invalid score ID'),
});

export type ScoreInputFormData = z.infer<typeof scoreInputSchema>;
export type UpdateScoreFormData = z.infer<typeof updateScoreSchema>;
