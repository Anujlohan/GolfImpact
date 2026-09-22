'use server';

import { requireSubscriber, requireAdmin } from '@/lib/auth/guards';
import { WinnerService } from '@/lib/services/winner.service';
import { PayoutService } from '@/lib/services/payout.service';
import {
  submitProofSchema,
  reviewProofSchema,
  processPayoutSchema,
} from '@/lib/validations/winner';
import { getErrorMessage } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export async function submitProofAction(formData: FormData) {
  try {
    const auth = await requireSubscriber();
    const rawData = {
      winnerId: formData.get('winnerId'),
      fileUrl: formData.get('fileUrl'),
    };

    const parsed = submitProofSchema.parse(rawData);
    const result = await WinnerService.submitProof(
      auth.userId,
      parsed.winnerId,
      parsed.fileUrl
    );

    revalidatePath('/dashboard/winnings');
    revalidatePath(`/dashboard/winner/${parsed.winnerId}`);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function reviewProofAction(formData: FormData) {
  try {
    const auth = await requireAdmin();
    const rawData = {
      winnerId: formData.get('winnerId'),
      approved: formData.get('approved') === 'true',
      rejectionReason: formData.get('rejectionReason')
        ? String(formData.get('rejectionReason'))
        : undefined,
    };

    const parsed = reviewProofSchema.parse(rawData);
    const result = await WinnerService.reviewProof(
      auth.userId,
      parsed.winnerId,
      parsed.approved,
      parsed.rejectionReason
    );

    revalidatePath('/admin/winners');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function processPayoutAction(formData: FormData) {
  try {
    const auth = await requireAdmin();
    const rawData = {
      winnerId: formData.get('winnerId'),
      paymentReference: formData.get('paymentReference'),
    };

    const parsed = processPayoutSchema.parse(rawData);
    const result = await PayoutService.processPayout(
      auth.userId,
      parsed.winnerId,
      parsed.paymentReference
    );

    revalidatePath('/admin/winners');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
