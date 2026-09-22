'use server';

import { requireAuth } from '@/lib/auth/guards';
import { SubscriptionService } from '@/lib/services/subscription.service';
import { checkoutSchema } from '@/lib/validations/subscription';
import { getErrorMessage } from '@/lib/utils/errors';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createCheckoutAction(formData: FormData) {
  try {
    const auth = await requireAuth();
    const rawData = {
      planId: formData.get('planId'),
    };

    const parsed = checkoutSchema.parse(rawData);
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    const result = await SubscriptionService.createCheckoutSession(
      auth.userId,
      auth.email,
      parsed.planId,
      origin
    );

    return { success: true, url: result.url };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function activateDevSubscriptionAction(planId: string) {
  try {
    const auth = await requireAuth();
    await SubscriptionService.activateSubscriptionDirectly(auth.userId, planId);
    revalidatePath('/dashboard');
    revalidatePath('/onboarding/charity');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
