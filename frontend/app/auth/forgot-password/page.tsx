'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('email', data.email);

    const res = await resetPasswordAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setServerError(res.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block text-lg font-bold text-white tracking-tight">
            Digital Heroes
          </Link>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-muted-foreground">Enter your email to receive recovery instructions.</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            {success ? (
              <div className="rounded border border-border bg-slate-900 p-4 text-center space-y-1">
                <h3 className="text-sm font-semibold text-white">Email Sent</h3>
                <p className="text-xs text-muted-foreground">
                  Please check your inbox for instructions to reset your password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                {serverError && (
                  <div className="rounded bg-rose-950/40 border border-rose-800 p-2.5 text-xs text-rose-300">
                    {serverError}
                  </div>
                )}

                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="pt-0 justify-center border-t border-border p-4">
            <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-white underline">
              ← Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
