import { requireSubscriber } from '@/lib/auth/guards';
import { ScoreService } from '@/lib/services/score.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { ScoreForm } from '@/components/scores/ScoreForm';
import { ScoreTable } from '@/components/scores/ScoreTable';
import { RollingScoreNotice } from '@/components/scores/RollingScoreNotice';

export default async function DashboardScoresPage() {
  const auth = await requireSubscriber();
  let scores: import('@/types/database').Score[] = [];

  try {
    scores = await ScoreService.getUserScores(auth.userId);
  } catch (err) {
    scores = [];
  }

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              My Scores (Max 5)
            </h1>
            <p className="text-xs text-muted-foreground">
              Register scores between 1 and 45. The 5 most recent unique date entries are included in monthly draws.
            </p>
          </div>

          <RollingScoreNotice currentCount={scores.length} />

          <ScoreForm />

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">Active Numbers</h2>
            <ScoreTable scores={scores} />
          </div>
        </div>
      </div>
    </div>
  );
}
