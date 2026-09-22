import { z } from 'zod';

export const createDrawSchema = z.object({
  drawMonth: z.number().int().min(1).max(12),
  drawYear: z.number().int().min(2024).max(2050),
  drawType: z.enum(['RANDOM', 'ALGORITHMIC']),
  totalPoolAmount: z.number().int().min(1000, 'Minimum prize pool is $10.00'),
});

export const publishDrawSchema = z.object({
  drawId: z.string().uuid('Invalid Draw ID'),
});

export type CreateDrawFormData = z.infer<typeof createDrawSchema>;
