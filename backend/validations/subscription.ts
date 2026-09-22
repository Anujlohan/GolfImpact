import { z } from 'zod';

export const checkoutSchema = z.object({
  planId: z.enum(['plan_monthly', 'plan_yearly'], {
    required_error: 'Please select a subscription plan',
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
