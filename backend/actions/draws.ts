'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { DrawService } from '@/lib/services/draw.service';
import { createDrawSchema, publishDrawSchema } from '@/lib/validations/draw';
import { getErrorMessage } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export async function createDrawAction(formData: FormData) {
  try {
    const auth = await requireAdmin();
    const rawData = {
      drawMonth: Number(formData.get('drawMonth')),
      drawYear: Number(formData.get('drawYear')),
      drawType: formData.get('drawType'),
      totalPoolAmount: Number(formData.get('totalPoolAmount')),
    };

    const parsed = createDrawSchema.parse(rawData);
    const result = await DrawService.createDraw(
      auth.userId,
      parsed.drawMonth,
      parsed.drawYear,
      parsed.drawType,
      parsed.totalPoolAmount
    );

    revalidatePath('/admin/draws');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function simulateDrawAction(drawId: string) {
  try {
    const auth = await requireAdmin();
    const result = await DrawService.simulateDraw(drawId, auth.userId);

    revalidatePath(`/admin/draws/${drawId}`);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function publishDrawAction(drawId: string) {
  try {
    const auth = await requireAdmin();
    const parsed = publishDrawSchema.parse({ drawId });
    const result = await DrawService.publishDraw(parsed.drawId, auth.userId);

    revalidatePath('/admin/draws');
    revalidatePath('/draw');
    revalidatePath('/dashboard/draws');
    revalidatePath('/dashboard/winnings');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
