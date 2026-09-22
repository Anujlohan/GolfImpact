'use client';

import { useState } from 'react';
import { WinnerWithDetails } from '@/types';
import { reviewProofAction, processPayoutAction } from '@/actions/winners';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';

interface WinnerReviewModalProps {
  winner: WinnerWithDetails | null;
  open: boolean;
  onClose: () => void;
}

export function WinnerReviewModal({ winner, open, onClose }: WinnerReviewModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentRef, setPaymentRef] = useState(`PAY-REF-${Date.now().toString().slice(-6)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!winner) return null;

  const handleReview = async (approved: boolean) => {
    setIsSubmitting(true);
    setActionError(null);

    const formData = new FormData();
    formData.append('winnerId', winner.id);
    formData.append('approved', approved ? 'true' : 'false');
    if (!approved) {
      formData.append('rejectionReason', rejectionReason || 'Screenshot did not match criteria');
    }

    const res = await reviewProofAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setActionError(res.error || 'Failed to review winner proof');
    }
  };

  const handleProcessPayout = async () => {
    setIsSubmitting(true);
    setActionError(null);

    const formData = new FormData();
    formData.append('winnerId', winner.id);
    formData.append('paymentReference', paymentRef);

    const res = await processPayoutAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setActionError(res.error || 'Failed to process payout');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Review Winner Proof"
      description={`Prize: ${formatCurrency(winner.prize_amount)} (${winner.tier.replace('_', ' ')})`}
    >
      <div className="space-y-4 text-xs">
        {/* User Info */}
        <div className="rounded border border-border bg-slate-900/60 p-3 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winner Name:</span>
            <span className="font-semibold text-white">{winner.profile?.full_name || 'Member'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Matched Count:</span>
            <span className="font-bold text-white">{winner.matched_count} Numbers</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verification:</span>
            <Badge
              variant={
                winner.verification_status === 'APPROVED'
                  ? 'default'
                  : winner.verification_status === 'REJECTED'
                  ? 'destructive'
                  : 'warning'
              }
            >
              {winner.verification_status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payout Status:</span>
            <Badge variant={winner.payout_status === 'PAID' ? 'default' : 'secondary'}>
              {winner.payout_status}
            </Badge>
          </div>
        </div>

        {/* Proof Screenshot */}
        <div className="space-y-1.5">
          <span className="font-medium text-white block">Submitted Proof:</span>
          {winner.proof?.file_url ? (
            <div className="rounded border border-border bg-slate-900 p-2 max-h-52 overflow-hidden">
              <img
                src={winner.proof.file_url}
                alt="Winner Proof"
                className="w-full h-44 object-cover rounded"
              />
            </div>
          ) : (
            <div className="rounded border border-border bg-slate-900/40 p-4 text-center text-muted-foreground">
              No proof uploaded yet.
            </div>
          )}
        </div>

        {/* Rejection reason input */}
        {winner.verification_status === 'PENDING' && (
          <Input
            label="Rejection Reason (Optional)"
            placeholder="e.g. Unclear screenshot"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        )}

        {/* Payout controls if approved but pending payout */}
        {winner.verification_status === 'APPROVED' && winner.payout_status === 'PENDING' && (
          <div className="space-y-2 rounded border border-border bg-slate-900 p-3">
            <div className="font-semibold text-white">Process Payout Transfer</div>
            <Input
              label="Payment Reference ID"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
            />
            <Button
              onClick={handleProcessPayout}
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              Mark as Paid ({formatCurrency(winner.prize_amount)})
            </Button>
          </div>
        )}

        {actionError && (
          <div className="rounded bg-rose-950/40 border border-rose-800 p-2 text-rose-300">
            {actionError}
          </div>
        )}

        {/* Approval / Rejection Action Buttons */}
        {winner.verification_status === 'PENDING' && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => handleReview(false)}
              isLoading={isSubmitting}
              variant="destructive"
            >
              Reject Proof
            </Button>

            <Button
              onClick={() => handleReview(true)}
              isLoading={isSubmitting}
              variant="default"
            >
              Approve Proof
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
