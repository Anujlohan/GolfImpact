import { z } from 'zod';

export const submitProofSchema = z.object({
  winnerId: z.string().uuid('Invalid winner ID'),
  fileUrl: z.string().url('Invalid proof URL'),
});

export const reviewProofSchema = z.object({
  winnerId: z.string().uuid('Invalid winner ID'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

export const processPayoutSchema = z.object({
  winnerId: z.string().uuid('Invalid winner ID'),
  paymentReference: z.string().min(3, 'Payment reference required'),
});

export type SubmitProofFormData = z.infer<typeof submitProofSchema>;
export type ReviewProofFormData = z.infer<typeof reviewProofSchema>;
export type ProcessPayoutFormData = z.infer<typeof processPayoutSchema>;
