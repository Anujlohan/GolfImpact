'use client';

import { useState } from 'react';
import { Draw, DrawSimulationResult } from '@/types/database';
import { simulateDrawAction, publishDrawAction } from '@/actions/draws';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';

interface DrawSimulationPreviewProps {
  draw: Draw;
}

export function DrawSimulationPreview({ draw }: DrawSimulationPreviewProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [simulation, setSimulation] = useState<DrawSimulationResult | null>(
    draw.simulation_result || null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [published, setPublished] = useState(draw.status === 'PUBLISHED' || draw.status === 'COMPLETED');

  const handleSimulate = async () => {
    setIsSimulating(true);
    setErrorMsg(null);
    const res = await simulateDrawAction(draw.id);
    setIsSimulating(false);

    if (res.success && res.data) {
      setSimulation(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to simulate draw');
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to officially PUBLISH this draw? This will create real winner records.')) {
      return;
    }

    setIsPublishing(true);
    setErrorMsg(null);
    const res = await publishDrawAction(draw.id);
    setIsPublishing(false);

    if (res.success) {
      setPublished(true);
    } else {
      setErrorMsg(res.error || 'Failed to publish draw');
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Header */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-white">
                  Draw Engine Simulation
                </CardTitle>
                <Badge variant={published ? 'default' : 'secondary'}>
                  {published ? 'PUBLISHED' : simulation ? 'SIMULATED' : 'DRAFT'}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Run sandbox simulations to preview matching distributions and rollover allocations before official publishing.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {!published && (
                <>
                  <Button
                    onClick={handleSimulate}
                    isLoading={isSimulating}
                    variant="outline"
                    size="sm"
                  >
                    Simulate Draw
                  </Button>

                  <Button
                    onClick={handlePublish}
                    isLoading={isPublishing}
                    disabled={!simulation}
                    size="sm"
                  >
                    Publish Draw
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {errorMsg && (
          <CardContent className="pt-0">
            <div className="rounded bg-rose-950/40 border border-rose-800 p-2.5 text-xs text-rose-300">
              {errorMsg}
            </div>
          </CardContent>
        )}

        {published && (
          <CardContent className="pt-0">
            <div className="rounded bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300">
              This draw is published and officially finalized.
            </div>
          </CardContent>
        )}
      </Card>

      {/* Simulation Results Breakdown */}
      {simulation && (
        <div className="space-y-4">
          {/* Numbers preview */}
          <div className="rounded border border-border bg-card p-4 space-y-2">
            <div className="text-xs text-muted-foreground font-semibold uppercase">
              Simulated Winning Numbers:
            </div>
            <div className="flex flex-wrap gap-2">
              {simulation.draw_numbers.map((num, i) => (
                <div key={i} className="lottery-ball">
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">Eligible Participants</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {simulation.total_participants}
              </span>
            </div>

            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">5-Match Winners (40%)</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {simulation.match_counts.tier_5}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {formatCurrency(simulation.tier_payouts.tier_5.per_winner)} / winner
              </span>
            </div>

            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">4-Match Winners (35%)</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {simulation.match_counts.tier_4}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {formatCurrency(simulation.tier_payouts.tier_4.per_winner)} / winner
              </span>
            </div>

            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">3-Match Winners (25%)</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {simulation.match_counts.tier_3}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {formatCurrency(simulation.tier_payouts.tier_3.per_winner)} / winner
              </span>
            </div>
          </div>

          {/* Rollover & Summary */}
          <div className="rounded border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Total Prize Pool</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {formatCurrency(simulation.total_pool)}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Total Payout</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                {formatCurrency(simulation.total_payout)}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Jackpot Rollover to Next Month</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {formatCurrency(simulation.total_rollover)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
