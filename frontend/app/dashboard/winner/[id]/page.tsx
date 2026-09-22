import { requireSubscriber } from '@/lib/auth/guards';
import { WinnerService } from '@/lib/services/winner.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { ProofUploadForm } from '@/components/winners/ProofUploadForm';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function WinnerClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireSubscriber();
  const { id } = await params;

  const winner = await WinnerService.getWinnerById(id);

  if (!winner || winner.user_id !== auth.userId) {
    notFound();
  }

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <Link
            href="/dashboard/winnings"
            className="text-xs text-muted-foreground hover:text-white"
          >
            ← Back to My Winnings
          </Link>

          {/* Winner Claim Header Card */}
          <div className="rounded border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                {winner.tier.replace('_', ' ')} • {winner.matched_count} Numbers Matched
              </div>
              <h1 className="text-2xl font-bold text-white">
                Prize: <span className="text-emerald-400">{formatCurrency(winner.prize_amount)}</span>
              </h1>
              <div className="text-xs text-muted-foreground">
                Recorded on {formatDate(winner.created_at)}
              </div>
            </div>

            <div className="space-y-1 text-right text-xs">
              <div>
                <span className="text-muted-foreground mr-2">Verification:</span>
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
              <div>
                <span className="text-muted-foreground mr-2">Payout:</span>
                <Badge variant={winner.payout_status === 'PAID' ? 'default' : 'secondary'}>
                  {winner.payout_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Proof Upload Form */}
          <ProofUploadForm
            winnerId={winner.id}
            currentProofUrl={winner.proof?.file_url}
            verificationStatus={winner.verification_status}
          />

          {/* Rejection Reason notice if rejected */}
          {winner.verification_status === 'REJECTED' && winner.proof?.rejection_reason && (
            <div className="rounded border border-rose-800 bg-rose-950/30 p-3 text-xs text-rose-300 space-y-1">
              <span className="font-semibold block">Admin Feedback:</span>
              <p>{winner.proof.rejection_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
