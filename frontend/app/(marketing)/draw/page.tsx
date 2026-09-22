import { DrawService } from '@/lib/services/draw.service';
import { DrawCard } from '@/components/draws/DrawCard';
import { DrawCountdown } from '@/components/draws/DrawCountdown';

export default async function DrawResultsPage() {
  let draws: import('@/types/database').Draw[] = [];
  try {
    draws = await DrawService.getDrawHistory();
  } catch (err) {
    draws = [];
  }

  const latestDraw = draws[0] || {
    id: 'demo-draw',
    draw_month: 8,
    draw_year: 2026,
    draw_type: 'RANDOM' as const,
    status: 'PUBLISHED' as const,
    draw_numbers: [7, 14, 23, 31, 42],
    total_pool_amount: 7500000,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    prize_pools: [
      { id: '1', draw_id: 'demo-draw', tier: '5_MATCH' as const, percentage: 40, amount: 3000000, rollover_amount: 3000000, created_at: '' },
      { id: '2', draw_id: 'demo-draw', tier: '4_MATCH' as const, percentage: 35, amount: 2625000, rollover_amount: 0, created_at: '' },
      { id: '3', draw_id: 'demo-draw', tier: '3_MATCH' as const, percentage: 25, amount: 1875000, rollover_amount: 0, created_at: '' },
    ],
  };

  const pastDraws = draws.length > 1 ? draws.slice(1) : [];

  return (
    <div className="py-12 md:py-16 mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Draw Results & Live Pool
        </h1>
        <p className="text-sm text-muted-foreground">
          Official drawn numbers and historical prize pools.
        </p>
      </div>

      {/* Countdown Box */}
      <div className="rounded border border-border bg-card p-6 text-center space-y-3 max-w-xl">
        <div className="text-xs text-muted-foreground uppercase font-semibold">
          Next Monthly Draw Closes In:
        </div>
        <DrawCountdown />
      </div>

      {/* Latest Draw Result */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          Latest Official Draw
        </h2>
        <div className="max-w-3xl">
          <DrawCard draw={latestDraw} isLatest />
        </div>
      </div>

      {/* Draw History Archive */}
      <div className="space-y-4 border-t border-border pt-8">
        <h2 className="text-xl font-bold text-white">
          Historical Draw Archive
        </h2>

        {pastDraws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastDraws.map((d) => (
              <DrawCard key={d.id} draw={d} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            No past draw archives recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
