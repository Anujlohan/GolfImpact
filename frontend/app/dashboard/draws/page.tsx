import { requireSubscriber } from '@/lib/auth/guards';
import { DrawService } from '@/lib/services/draw.service';
import { ScoreService } from '@/lib/services/score.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { DrawCard } from '@/components/draws/DrawCard';
import { DrawCountdown } from '@/components/draws/DrawCountdown';
import { Badge } from '@/components/ui/Badge';

export default async function DashboardDrawsPage() {
  const auth = await requireSubscriber();
  let draws: import('@/types/database').Draw[] = [];
  let userScores: import('@/types/database').Score[] = [];

  try {
    draws = await DrawService.getDrawHistory();
    userScores = await ScoreService.getUserScores(auth.userId);
  } catch (err) {
    draws = [];
  }

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Draw Eligibility & History
            </h1>
            <p className="text-xs text-muted-foreground">
              Review current eligibility status and historical draw results.
            </p>
          </div>

          {/* Current snapshot eligibility status */}
          <div className="rounded border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Current Eligibility:</span>
                <Badge variant={userScores.length > 0 ? 'default' : 'warning'}>
                  {userScores.length > 0 ? 'Eligible' : 'Needs Score'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {userScores.length > 0
                  ? `${userScores.length} score(s) currently staged for the upcoming draw snapshot.`
                  : 'Enter at least 1 score to participate.'}
              </p>
            </div>

            <div className="flex gap-1.5">
              {userScores.map((s, idx) => (
                <div key={idx} className="lottery-ball scale-90">
                  {s.score}
                </div>
              ))}
            </div>
          </div>

          {/* Countdown Card */}
          <div className="rounded border border-border bg-card p-5 space-y-2">
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Next Live Draw Closing In:
            </div>
            <DrawCountdown />
          </div>

          {/* Past Draws History */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">Historical Draw Archive</h2>
            {draws.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draws.map((draw) => (
                  <DrawCard
                    key={draw.id}
                    draw={draw}
                    userSnapshot={userScores.map((s) => s.score)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded border border-border bg-card p-8 text-center text-xs text-muted-foreground">
                No past draws archived yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
