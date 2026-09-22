'use server';

import { requireSubscriber, requireAdmin, requireAuth } from '@/lib/auth/guards';
import { CharityService } from '@/lib/services/charity.service';
import { charitySelectionSchema, charityAdminSchema, directDonationSchema } from '@/lib/validations/charity';
import { getErrorMessage } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export async function setCharitySelectionAction(formData: FormData) {
  try {
    const auth = await requireSubscriber();
    const rawData = {
      charityId: formData.get('charityId'),
      contributionPercentage: Number(formData.get('contributionPercentage')),
    };

    const parsed = charitySelectionSchema.parse(rawData);
    const result = await CharityService.setCharitySelection(
      auth.userId,
      parsed.charityId,
      parsed.contributionPercentage
    );

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/charity');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function directDonationAction(formData: FormData) {
  try {
    let userId: string | null = null;
    try {
      const auth = await requireAuth();
      userId = auth.userId;
    } catch {
      // Allow anonymous/visitor donation
    }

    const rawCharityId = formData.get('charityId');
    const rawAmount = formData.get('amount');
    const rawEmail = formData.get('email');

    // Strict validation: check for missing or empty amount input
    if (rawAmount === null || rawAmount === undefined || String(rawAmount).trim() === '') {
      return { success: false, error: 'Please select or enter a donation amount.' };
    }

    const parsedAmount = Number(rawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return { success: false, error: 'Donation amount must be a positive number of at least $1.00.' };
    }

    const emailStr = rawEmail ? String(rawEmail).trim() : '';

    const parsed = directDonationSchema.parse({
      charityId: rawCharityId ? String(rawCharityId) : '',
      amount: parsedAmount,
      email: emailStr || undefined,
    });

    const amountInCents = Math.round(parsed.amount * 100);
    const donation = await CharityService.processDirectDonation(
      userId,
      parsed.charityId,
      amountInCents,
      parsed.email || undefined
    );

    revalidatePath('/charities');
    revalidatePath(`/charities/${parsed.charityId}`);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    revalidatePath('/admin/reports');
    return { success: true, data: donation };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function adminSaveCharityAction(formData: FormData) {
  try {
    const auth = await requireAdmin();
    const rawData = {
      id: formData.get('id') ? String(formData.get('id')) : undefined,
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      imageUrl: formData.get('imageUrl'),
      websiteUrl: formData.get('websiteUrl') || undefined,
      category: formData.get('category') || 'Community',
      isFeatured: formData.get('isFeatured') === 'true',
      isActive: formData.get('isActive') !== 'false',
    };

    const parsed = charityAdminSchema.parse(rawData);
    const result = await CharityService.adminSaveCharity(auth.userId, {
      ...parsed,
      id: rawData.id,
    });

    revalidatePath('/admin/charities');
    revalidatePath('/charities');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function adminDeleteCharityAction(charityId: string) {
  try {
    const auth = await requireAdmin();
    await CharityService.deleteCharity(auth.userId, charityId);
    revalidatePath('/admin/charities');
    revalidatePath('/charities');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
