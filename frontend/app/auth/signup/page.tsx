'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validations/auth';
import { signUpAction } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.phone) formData.append('phone', data.phone);

    const res = await signUpAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      window.location.href = '/onboarding/subscription';
    } else {
      setServerError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block text-lg font-bold text-white tracking-tight">
            Digital Heroes
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-muted-foreground">Register to participate in monthly draws and support causes.</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password (min. 6 chars)"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+1 (555) 000-0000"
                error={errors.phone?.message}
                {...register('phone')}
              />

              {serverError && (
                <div className="rounded bg-rose-950/40 border border-rose-800 p-2.5 text-xs text-rose-300">
                  {serverError}
                </div>
              )}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Register & Proceed
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0 justify-center border-t border-border p-4">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-white underline font-medium">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
