import { requireSubscriber } from '@/lib/auth/guards';
import { WinnerService } from '@/lib/services/winner.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import Link from 'next/link';

export default async function DashboardWinningsPage() {
  const auth = await requireSubscriber();
  let winnings: import('@/types').WinnerWithDetails[] = [];

  try {
    winnings = await WinnerService.getUserWinnings(auth.userId);
  } catch (err) {
    winnings = [];
  }

  const totalWon = winnings.reduce((acc, curr) => acc + (curr.prize_amount || 0), 0);

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">
                Prize Claims & Winnings
              </h1>
              <p className="text-xs text-muted-foreground">
                Track prize distributions, upload screenshot proof, and monitor payout status.
              </p>
            </div>

            <div className="rounded border border-border bg-card px-4 py-2 text-right">
              <span className="text-[11px] text-muted-foreground uppercase font-medium block">Total Won</span>
              <span className="text-xl font-bold text-white">{formatCurrency(totalWon)}</span>
            </div>
          </div>

          {/* Winnings List */}
          {winnings.length > 0 ? (
            <div className="space-y-3">
              {winnings.map((w) => (
                <div
                  key={w.id}
                  className="rounded border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {w.tier.replace('_', ' ')} ({w.matched_count} matches)
                      </span>
                      <span className="text-muted-foreground">
                        • {formatDate(w.created_at)}
                      </span>
                    </div>

                    <div className="text-base font-bold text-emerald-400">
                      Prize: {formatCurrency(w.prize_amount)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Verification:</span>
                      <Badge
                        variant={
                          w.verification_status === 'APPROVED'
                            ? 'default'
                            : w.verification_status === 'REJECTED'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {w.verification_status}
                      </Badge>

                      <span className="text-muted-foreground ml-2">Payout:</span>
                      <Badge variant={w.payout_status === 'PAID' ? 'default' : 'secondary'}>
                        {w.payout_status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Link href={`/dashboard/winner/${w.id}`}>
                      <Button
                        variant={w.proof ? 'outline' : 'default'}
                        size="sm"
                      >
                        {w.proof ? 'View Proof & Status' : 'Upload Proof Screenshot'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-border bg-card p-8 text-center text-xs text-muted-foreground">
              No winning records recorded yet. Keep entering your daily scores to participate in upcoming draws.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
