import { Draw } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getMonthName, formatDate } from '@/lib/utils/dates';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';

interface DrawCardProps {
  draw: Draw;
  isLatest?: boolean;
  userSnapshot?: number[];
}

export function DrawCard({ draw, isLatest = false, userSnapshot }: DrawCardProps) {
  const monthName = getMonthName(draw.draw_month);
  const pool5 = draw.prize_pools?.find((p) => p.tier === '5_MATCH');
  const pool4 = draw.prize_pools?.find((p) => p.tier === '4_MATCH');
  const pool3 = draw.prize_pools?.find((p) => p.tier === '3_MATCH');

  const totalPool = draw.total_pool_amount || 5000000;
  const drawNumsSet = new Set(draw.draw_numbers || []);

  const matchedNumbers = userSnapshot ? userSnapshot.filter((n) => drawNumsSet.has(n)) : [];
  const matchCount = matchedNumbers.length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-white">
              {monthName} {draw.draw_year} Draw
            </CardTitle>
            {isLatest && <Badge variant="default">Latest Official Result</Badge>}
          </div>
          <CardDescription className="text-xs">
            {draw.published_at ? `Published on ${formatDate(draw.published_at)}` : 'Completed'}
          </CardDescription>
        </div>

        <Badge variant="secondary" className="uppercase text-[10px]">
          {draw.draw_type}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Winning Number Balls */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground block">
            Winning Numbers:
          </span>
          <div className="flex flex-wrap gap-2">
            {draw.draw_numbers && draw.draw_numbers.length > 0 ? (
              draw.draw_numbers.map((num, idx) => {
                const isMatched = userSnapshot && userSnapshot.includes(num);
                return (
                  <div
                    key={idx}
                    className={`lottery-ball ${
                      isMatched
                        ? 'ring-2 ring-emerald-400 bg-emerald-950/80 text-emerald-200 font-extrabold shadow-lg shadow-emerald-950/50'
                        : ''
                    }`}
                  >
                    {num}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-muted-foreground italic">No numbers drawn yet</div>
            )}
          </div>
        </div>

        {/* User Snapshot Match Banner (if subscriber viewing) */}
        {userSnapshot && userSnapshot.length > 0 && draw.draw_numbers && draw.draw_numbers.length > 0 && (
          <div
            className={`rounded p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
              matchCount >= 3
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-slate-900/60 border-border text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Your Match Status:</span>
              <span>
                {matchCount >= 5
                  ? `🎉 5 Numbers Matched (Jackpot Winner!)`
                  : matchCount === 4
                  ? `🏆 4 Numbers Matched (4-Match Winner!)`
                  : matchCount === 3
                  ? `✨ 3 Numbers Matched (3-Match Winner!)`
                  : `${matchCount} number${matchCount === 1 ? '' : 's'} matched (Requires 3+ to win prize)`}
              </span>
            </div>

            {matchCount >= 3 && (
              <Link
                href="/dashboard/winnings"
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                View Prize Claim →
              </Link>
            )}
          </div>
        )}

        {/* Prize Pool Distribution Breakdown */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Total Prize Pool:
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCurrency(totalPool)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-border">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">5-Match (40%)</span>
              <span className="font-mono font-bold text-white block">
                {formatCurrency(pool5?.amount || Math.floor(totalPool * 0.4))}
              </span>
              {pool5?.rollover_amount ? (
                <span className="text-[10px] text-muted-foreground block">
                  Rollover: {formatCurrency(pool5.rollover_amount)}
                </span>
              ) : null}
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">4-Match (35%)</span>
              <span className="font-mono font-bold text-white block">
                {formatCurrency(pool4?.amount || Math.floor(totalPool * 0.35))}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">3-Match (25%)</span>
              <span className="font-mono font-bold text-white block">
                {formatCurrency(pool3?.amount || Math.floor(totalPool * 0.25))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
