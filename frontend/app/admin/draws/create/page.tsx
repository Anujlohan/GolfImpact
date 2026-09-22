'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDrawSchema, CreateDrawFormData } from '@/lib/validations/draw';
import { createDrawAction } from '@/actions/draws';
import { AdminNav } from '@/components/layout/AdminNav';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function AdminCreateDrawPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDrawFormData>({
    resolver: zodResolver(createDrawSchema),
    defaultValues: {
      drawMonth: currentMonth,
      drawYear: currentYear,
      drawType: 'RANDOM',
      totalPoolAmount: 7500000, // $75,000 in cents
    },
  });

  const onSubmit = async (data: CreateDrawFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('drawMonth', data.drawMonth.toString());
    formData.append('drawYear', data.drawYear.toString());
    formData.append('drawType', data.drawType);
    formData.append('totalPoolAmount', data.totalPoolAmount.toString());

    const res = await createDrawAction(formData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      window.location.href = `/admin/draws/${res.data.id}`;
    } else {
      setServerError(res.error || 'Failed to create draw');
    }
  };

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <Link
            href="/admin/draws"
            className="text-xs text-muted-foreground hover:text-white"
          >
            ← Back to Draws
          </Link>

          <Card className="border-border bg-card max-w-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white">
                Configure New Draw Draft
              </CardTitle>
              <CardDescription className="text-xs">
                Creating a draft will automatically snapshot current eligible subscribers' 5 scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Draw Month (1 - 12)"
                    type="number"
                    min={1}
                    max={12}
                    error={errors.drawMonth?.message}
                    {...register('drawMonth', { valueAsNumber: true })}
                  />

                  <Input
                    label="Draw Year"
                    type="number"
                    min={2024}
                    max={2050}
                    error={errors.drawYear?.message}
                    {...register('drawYear', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">
                    Draw Calculation Engine
                  </label>
                  <select
                    className="flex h-10 w-full rounded border border-border bg-slate-900 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    {...register('drawType')}
                  >
                    <option value="RANDOM">Random Draw (RANDOM)</option>
                    <option value="ALGORITHMIC">Frequency-Weighted (ALGORITHMIC)</option>
                  </select>
                </div>

                <Input
                  label="Prize Pool (in cents, e.g. 7500000 for $75,000.00)"
                  type="number"
                  min={1000}
                  error={errors.totalPoolAmount?.message}
                  {...register('totalPoolAmount', { valueAsNumber: true })}
                />

                {serverError && (
                  <div className="rounded bg-rose-950/40 border border-rose-800 p-2.5 text-xs text-rose-300">
                    {serverError}
                  </div>
                )}

                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Create Draft & Snapshot Participants
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
