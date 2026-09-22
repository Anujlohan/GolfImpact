'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { signInAction } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const res = await signInAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      window.location.href = '/dashboard';
    } else {
      setServerError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block text-lg font-bold text-white tracking-tight">
            Digital Heroes
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign In</h1>
          <p className="text-xs text-muted-foreground">Enter your credentials to access your account.</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-200">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-white underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              {serverError && (
                <div className="rounded bg-rose-950/40 border border-rose-800 p-2.5 text-xs text-rose-300">
                  {serverError}
                </div>
              )}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0 justify-center border-t border-border p-4">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account yet?{' '}
              <Link href="/auth/signup" className="text-white underline font-medium">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
