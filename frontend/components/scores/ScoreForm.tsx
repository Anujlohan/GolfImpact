'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { scoreInputSchema, ScoreInputFormData } from '@/lib/validations/scores';
import { addScoreAction } from '@/actions/scores';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export function ScoreForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScoreInputFormData>({
    resolver: zodResolver(scoreInputSchema),
    defaultValues: {
      scoreDate: today,
    },
  });

  const onSubmit = async (data: ScoreInputFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('score', data.score.toString());
    formData.append('scoreDate', data.scoreDate);

    const res = await addScoreAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(`Score ${data.score} registered for ${data.scoreDate}.`);
      reset({ scoreDate: today });
    } else {
      setServerError(res.error || 'Failed to submit score');
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-white">
          Add Score Entry
        </CardTitle>
        <CardDescription className="text-xs">
          Enter an integer score between 1 and 45 for a specific date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Score (1 - 45)"
              type="number"
              min={1}
              max={45}
              placeholder="e.g. 38"
              error={errors.score?.message}
              {...register('score', { valueAsNumber: true })}
            />

            <Input
              label="Score Date"
              type="date"
              error={errors.scoreDate?.message}
              {...register('scoreDate')}
            />
          </div>

          {serverError && (
            <div className="rounded bg-rose-950/40 p-2.5 text-xs text-rose-300 border border-rose-800">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="rounded bg-emerald-950/40 p-2.5 text-xs text-emerald-300 border border-emerald-800">
              {successMessage}
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            Submit Score
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
