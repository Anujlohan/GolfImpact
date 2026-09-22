'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { directDonationAction } from '@/actions/charity';

interface DirectDonationModalProps {
  charityId: string;
  charityName: string;
}

export function DirectDonationModal({ charityId, charityName }: DirectDonationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetAmount, setPresetAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedDonation, setConfirmedDonation] = useState<{ amount: number } | null>(null);

  const presetAmounts = [25, 50, 100, 250];

  // Derived effective donation amount
  const effectiveAmount: number | null =
    customAmount.trim() !== ''
      ? parseFloat(customAmount)
      : presetAmount;

  const isValidAmount =
    effectiveAmount !== null &&
    !isNaN(effectiveAmount) &&
    effectiveAmount >= 1;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!effectiveAmount || isNaN(effectiveAmount) || effectiveAmount < 1) {
      setErrorMsg('Please select a preset amount or enter a custom donation amount of at least $1.00.');
      return;
    }

    if (effectiveAmount > 100000) {
      setErrorMsg('Maximum single donation amount is $100,000.00.');
      return;
    }

    // Optional email validation
    const trimmedEmail = email.trim();
    if (trimmedEmail !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMsg('Please enter a valid email address for your receipt.');
        return;
      }
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('charityId', charityId);
    formData.append('amount', effectiveAmount.toString());
    if (trimmedEmail) formData.append('email', trimmedEmail);

    const res = await directDonationAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setConfirmedDonation({ amount: effectiveAmount });
      setSuccess(true);
    } else {
      setErrorMsg(res.error || 'Failed to process donation. Please try again.');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPresetAmount(null);
    setCustomAmount('');
    setEmail('');
    setSuccess(false);
    setErrorMsg(null);
    setConfirmedDonation(null);
  };

  const handleOpen = () => {
    setPresetAmount(null);
    setCustomAmount('');
    setEmail('');
    setSuccess(false);
    setErrorMsg(null);
    setConfirmedDonation(null);
    setIsOpen(true);
  };

  return (
    <>
      <Button onClick={handleOpen} variant="outline" size="sm">
        Donate Directly
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-slate-950 p-6 space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Direct Contribution</h2>
                <p className="text-xs text-muted-foreground">Support {charityName}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-white"
                type="button"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="space-y-4 py-4 text-center">
                <div className="text-emerald-400 text-sm font-semibold">
                  ✓ Donation of ${confirmedDonation?.amount.toFixed(2)} Processed Successfully!
                </div>
                <p className="text-xs text-slate-300">
                  Thank you for directly backing {charityName}. Your contribution has been recorded in the platform ledger.
                </p>
                <Button onClick={handleClose} className="w-full" size="sm">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleDonate} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      Select Amount (USD) <span className="text-rose-400">*</span>
                    </label>
                    {effectiveAmount && isValidAmount && (
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${effectiveAmount.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {presetAmounts.map((val) => {
                      const isSelected = customAmount === '' && presetAmount === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setPresetAmount(val);
                            setCustomAmount('');
                            setErrorMsg(null);
                          }}
                          className={`py-2 text-xs font-mono font-semibold rounded border transition-colors ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/20 text-white'
                              : 'border-border text-slate-300 hover:border-slate-600 bg-slate-900'
                          }`}
                        >
                          ${val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Or Custom Amount ($)"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="Enter custom amount (min $1.00)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setPresetAmount(null);
                    setErrorMsg(null);
                  }}
                />

                <Input
                  label="Donor Email (Optional for Receipt)"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                />

                {errorMsg && (
                  <div className="rounded bg-rose-950/40 border border-rose-800 p-2 text-xs text-rose-300">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isValidAmount
                      ? `Confirm $${effectiveAmount.toFixed(2)} Donation`
                      : 'Confirm Donation'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
