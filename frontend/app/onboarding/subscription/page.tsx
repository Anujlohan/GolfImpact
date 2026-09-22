'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createCheckoutAction, activateDevSubscriptionAction } from '@/actions/subscription';

export default function SubscriptionOnboardingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'plan_monthly' | 'plan_yearly'>('plan_yearly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('planId', selectedPlan);

    const res = await createCheckoutAction(formData);
    setIsSubmitting(false);

    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setErrorMsg(res.error || 'Failed to initialize subscription checkout');
    }
  };

  const handleQuickActivate = async () => {
    setIsSubmitting(true);
    const res = await activateDevSubscriptionAction(selectedPlan);
    setIsSubmitting(false);
    if (res.success) {
      window.location.href = '/onboarding/charity';
    }
  };

  return (
    <div className="py-12 md:py-16 mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Select Membership Plan
        </h1>
        <p className="text-sm text-muted-foreground">
          Enables monthly draw eligibility, score tracking, and automated charity donation allocations.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Plan */}
        <div
          onClick={() => setSelectedPlan('plan_monthly')}
          className={`cursor-pointer rounded border p-6 flex flex-col justify-between transition-colors ${
            selectedPlan === 'plan_monthly'
              ? 'border-white bg-card'
              : 'border-border bg-card/60 hover:border-slate-700'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Monthly Pass</h3>
              <span className="text-xs text-muted-foreground">Billed monthly</span>
            </div>

            <div className="text-2xl font-bold text-white font-mono">
              $15.00 <span className="text-xs font-normal text-muted-foreground">/ month</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Cancel anytime. Grants full eligibility for each monthly draw.
            </p>

            <ul className="space-y-1.5 pt-3 border-t border-border text-xs text-slate-300">
              <li>• Up to 5 rolling scores per month</li>
              <li>• Entry into all monthly jackpot pools</li>
              <li>• Dedicated verified charity beneficiary</li>
              <li>• Instant winner screenshot claims</li>
            </ul>
          </div>

          <div className="pt-4 text-xs font-medium text-white">
            {selectedPlan === 'plan_monthly' ? 'Selected' : 'Select plan'}
          </div>
        </div>

        {/* Yearly Plan */}
        <div
          onClick={() => setSelectedPlan('plan_yearly')}
          className={`cursor-pointer rounded border p-6 flex flex-col justify-between transition-colors ${
            selectedPlan === 'plan_yearly'
              ? 'border-white bg-card'
              : 'border-border bg-card/60 hover:border-slate-700'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Annual Pass</h3>
              <span className="text-xs text-muted-foreground font-mono">Save 20%</span>
            </div>

            <div className="text-2xl font-bold text-white font-mono">
              $144.00 <span className="text-xs font-normal text-muted-foreground">/ year ($12/mo)</span>
            </div>

            <p className="text-xs text-muted-foreground">
              12 months of draw eligibility with annual billing.
            </p>

            <ul className="space-y-1.5 pt-3 border-t border-border text-xs text-slate-300">
              <li>• 12 full months of jackpot participation</li>
              <li>• Maximum charity grant impact matching</li>
              <li>• 5 rolling score slots with auto-pruning</li>
              <li>• Expedited prize verification & payouts</li>
            </ul>
          </div>

          <div className="pt-4 text-xs font-medium text-white">
            {selectedPlan === 'plan_yearly' ? 'Selected' : 'Select plan'}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded bg-rose-950/40 border border-rose-800 p-2 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Checkout Action Button */}
      <div className="flex flex-col items-start gap-2 pt-2">
        <Button
          onClick={handleCheckout}
          isLoading={isSubmitting}
          size="lg"
        >
          Proceed to Checkout
        </Button>

        <button
          onClick={handleQuickActivate}
          className="text-xs text-muted-foreground hover:text-white underline pt-1"
        >
          (Dev mode: Activate directly without Stripe)
        </button>
      </div>
    </div>
  );
}
