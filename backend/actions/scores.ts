'use server';

import { requireSubscriber } from '@/lib/auth/guards';
import { ScoreService } from '@/lib/services/score.service';
import { scoreInputSchema, updateScoreSchema } from '@/lib/validations/scores';
import { getErrorMessage } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export async function addScoreAction(formData: FormData) {
  try {
    const auth = await requireSubscriber();
    const rawData = {
      score: Number(formData.get('score')),
      scoreDate: formData.get('scoreDate'),
    };

    const parsed = scoreInputSchema.parse(rawData);
    const result = await ScoreService.addScore(auth.userId, parsed.score, parsed.scoreDate);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/scores');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function updateScoreAction(formData: FormData) {
  try {
    const auth = await requireSubscriber();
    const rawData = {
      id: formData.get('id'),
      score: Number(formData.get('score')),
      scoreDate: formData.get('scoreDate'),
    };

    const parsed = updateScoreSchema.parse(rawData);
    const result = await ScoreService.updateScore(
      auth.userId,
      parsed.id,
      parsed.score,
      parsed.scoreDate
    );

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/scores');
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function deleteScoreAction(scoreId: string) {
  try {
    const auth = await requireSubscriber();
    await ScoreService.deleteScore(auth.userId, scoreId);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/scores');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
