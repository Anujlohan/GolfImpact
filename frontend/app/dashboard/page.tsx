import { requireSubscriber } from '@/lib/auth/guards';
import { ScoreService } from '@/lib/services/score.service';
import { CharityService } from '@/lib/services/charity.service';
import { DrawService } from '@/lib/services/draw.service';
import { WinnerService } from '@/lib/services/winner.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { ScoreForm } from '@/components/scores/ScoreForm';
import { ScoreTable } from '@/components/scores/ScoreTable';
import { DrawCountdown } from '@/components/draws/DrawCountdown';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import Link from 'next/link';

export default async function DashboardOverviewPage() {
  const auth = await requireSubscriber();

  let scores: import('@/types/database').Score[] = [];
  let charitySelection: import('@/types/database').CharitySelection | null = null;
  let winnings: import('@/types').WinnerWithDetails[] = [];
  let latestDraw: import('@/types/database').Draw | null = null;

  try {
    scores = await ScoreService.getUserScores(auth.userId);
    charitySelection = await CharityService.getUserCharitySelection(auth.userId);
    winnings = await WinnerService.getUserWinnings(auth.userId);
    latestDraw = await DrawService.getLatestDraw();
  } catch (err) {
    // Handle offline/mock
  }

  const totalWon = winnings.reduce((acc, curr) => acc + (curr.prize_amount || 0), 0);
  const pendingClaims = winnings.filter((w) => w.verification_status === 'PENDING' || !w.proof);

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <DashboardNav />

        {/* Main Content Area: 5 PRD § 10 Modules */}
        <div className="flex-1 space-y-6">
          {/* Header & Welcome */}
          <div className="rounded border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="text-xs text-muted-foreground">
                Signed in as {auth.profile.full_name} ({auth.email})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/scores">
                <Button size="sm">
                  Add Score
                </Button>
              </Link>
            </div>
          </div>

          {/* MODULE 1: Subscription Status (§ 10.1) */}
          <div className="rounded border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                1. Subscription Status
              </div>
              <Badge variant="default">
                {auth.subscription?.status || 'ACTIVE'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <span className="text-muted-foreground block">Plan Tier:</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {auth.subscription?.plan_id === 'plan_yearly' ? 'Annual Pass ($144/yr)' : 'Monthly Pass ($15/mo)'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Renewal Date:</span>
                <span className="font-semibold text-white mt-0.5 block font-mono">
                  {formatDate(auth.subscription?.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString())}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Account Management:</span>
                <Link href="/dashboard/subscription" className="text-emerald-400 hover:underline mt-0.5 block font-medium">
                  Manage Plan & Billing →
                </Link>
              </div>
            </div>
          </div>

          {/* MODULE 2: Score Management & Rolling Queue (§ 10.2, § 05) */}
          <div className="rounded border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  2. Golf Scores Snapshot (Rolling 5)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Valid range 1–45 (Stableford). One score per date. New scores automatically replace the oldest entry.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-border">
                {scores.length} / 5 Active
              </span>
            </div>

            {/* Inline Quick Score Entry */}
            <ScoreForm />

            {/* 5-Score Rolling Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Active Rolling Numbers</span>
                <span className="text-muted-foreground">Reverse chronological order</span>
              </div>
              <ScoreTable scores={scores} />
            </div>
          </div>

          {/* MODULE 3: Selected Charity & Contribution Percentage (§ 10.3, § 08) */}
          <div className="rounded border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                3. Dedicated Charity Cause
              </div>
              <Link href="/dashboard/charity" className="text-xs text-muted-foreground hover:text-white underline">
                Change Cause / Pledge →
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {charitySelection?.charity?.name || 'Code For Humanity'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  {charitySelection?.charity?.description || 'Empowering underprivileged youth through digital literacy and software bootcamps.'}
                </p>
              </div>

              <div className="bg-slate-900 border border-border rounded p-3 text-right shrink-0">
                <span className="text-xs text-muted-foreground block">Donation Pledge:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {charitySelection?.contribution_percentage || 15}%
                </span>
                <span className="text-[10px] text-muted-foreground block">of winnings</span>
              </div>
            </div>
          </div>

          {/* MODULE 4: Participation Summary & Upcoming Draw (§ 10.4, § 06) */}
          <div className="rounded border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  4. Participation & Live Draw
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your active 5 scores are automatically entered into the monthly jackpot draw.
                </p>
              </div>
              <Badge variant="secondary">
                Eligible Member
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded border border-border bg-slate-900 p-4 space-y-2">
                <span className="text-xs text-muted-foreground block font-medium">Active Entry Numbers:</span>
                <div className="flex flex-wrap gap-2">
                  {scores.length > 0 ? (
                    scores.map((s) => (
                      <div key={s.id} className="lottery-ball">
                        {s.score}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Enter scores above to participate in draw.</span>
                  )}
                </div>
              </div>

              <div className="rounded border border-border bg-slate-900 p-4 space-y-2 text-center">
                <span className="text-xs text-muted-foreground uppercase font-semibold block">
                  Next Monthly Draw In:
                </span>
                <DrawCountdown />
              </div>
            </div>
          </div>

          {/* MODULE 5: Winnings Overview & Verification Claims (§ 10.5, § 09) */}
          <div className="rounded border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  5. Winnings Overview & Claim Proof
                </h2>
                <p className="text-xs text-muted-foreground">
                  View winning prize records, upload golf scorecard screenshots for verification, and track payouts.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Total Won:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {formatCurrency(totalWon)}
                </span>
              </div>
            </div>

            {/* Pending claim banner if any */}
            {pendingClaims.length > 0 && (
              <div className="rounded border border-amber-800 bg-amber-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-amber-300">
                    ⚠ Action Required: {pendingClaims.length} Unclaimed Prize
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    Upload your score proof screenshot from your golf platform/club to receive payout.
                  </div>
                </div>
                <Link href={`/dashboard/winner/${pendingClaims[0].id}`}>
                  <Button size="sm">
                    Upload Proof
                  </Button>
                </Link>
              </div>
            )}

            {/* Winnings list */}
            {winnings.length > 0 ? (
              <div className="divide-y divide-border border border-border rounded overflow-hidden">
                {winnings.map((w) => (
                  <div key={w.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">
                        {w.tier.replace('_', ' ')} • {w.matched_count} Matches
                      </div>
                      <div className="text-muted-foreground">
                        Prize: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(w.prize_amount)}</span> • Date: {formatDate(w.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="space-y-1 text-right">
                        <div>
                          <span className="text-muted-foreground mr-1">Proof:</span>
                          <Badge variant={w.verification_status === 'APPROVED' ? 'default' : w.verification_status === 'REJECTED' ? 'destructive' : 'warning'}>
                            {w.verification_status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground mr-1">Payout:</span>
                          <Badge variant={w.payout_status === 'PAID' ? 'default' : 'secondary'}>
                            {w.payout_status}
                          </Badge>
                        </div>
                      </div>

                      <Link href={`/dashboard/winner/${w.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          {w.verification_status === 'PENDING' && !w.proof ? 'Upload Proof' : 'View Claim'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs rounded border border-border bg-slate-900/20">
                No prize winnings recorded yet. Ensure your 5 rolling scores are active for the upcoming draw!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
