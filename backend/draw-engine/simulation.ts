import { generateRandomDrawNumbers } from './random';
import { generateAlgorithmicDrawNumbers } from './algorithmic';
import { evaluateAllParticipants } from './matching';
import { calculatePrizeDistribution } from './prize-pool';
import { DrawType, DrawSimulationResult } from '@/types/database';

export interface SimulationParams {
  drawId: string;
  drawMonth: number;
  drawYear: number;
  drawType: DrawType;
  totalPoolAmount: number;
  participants: { userId: string; snapshot: number[] }[];
}

/**
 * Runs a complete sandboxed draw simulation without mutating published state.
 */
export function runDrawSimulation(params: SimulationParams): DrawSimulationResult {
  const { drawId, drawMonth, drawYear, drawType, totalPoolAmount, participants } = params;

  // 1. Generate Numbers
  let drawNumbers: number[];
  if (drawType === 'ALGORITHMIC') {
    const seed = `sim_${drawId}_${drawYear}_${drawMonth}_${totalPoolAmount}`;
    drawNumbers = generateAlgorithmicDrawNumbers({
      participantSnapshots: participants.map((p) => p.snapshot),
      seedString: seed,
    });
  } else {
    drawNumbers = generateRandomDrawNumbers();
  }

  // 2. Evaluate Matches
  const evaluation = evaluateAllParticipants(participants, drawNumbers);

  const winnerCounts = {
    '5_MATCH': evaluation.tier5Winners.length,
    '4_MATCH': evaluation.tier4Winners.length,
    '3_MATCH': evaluation.tier3Winners.length,
  };

  // 3. Calculate Prize Distribution & Rollovers
  const prizeDist = calculatePrizeDistribution(totalPoolAmount, winnerCounts);

  const noMatchCount =
    participants.length -
    (winnerCounts['5_MATCH'] + winnerCounts['4_MATCH'] + winnerCounts['3_MATCH']);

  return {
    simulated_at: new Date().toISOString(),
    draw_numbers: drawNumbers,
    algorithm_used: drawType,
    total_participants: participants.length,
    match_counts: {
      tier_5: winnerCounts['5_MATCH'],
      tier_4: winnerCounts['4_MATCH'],
      tier_3: winnerCounts['3_MATCH'],
      no_match: Math.max(0, noMatchCount),
    },
    tier_payouts: {
      tier_5: {
        total_amount: prizeDist.tiers['5_MATCH'].totalAmount,
        per_winner: prizeDist.tiers['5_MATCH'].perWinnerAmount,
        winner_count: prizeDist.tiers['5_MATCH'].winnerCount,
        rollover: prizeDist.tiers['5_MATCH'].rolloverAmount,
      },
      tier_4: {
        total_amount: prizeDist.tiers['4_MATCH'].totalAmount,
        per_winner: prizeDist.tiers['4_MATCH'].perWinnerAmount,
        winner_count: prizeDist.tiers['4_MATCH'].winnerCount,
        rollover: prizeDist.tiers['4_MATCH'].rolloverAmount,
      },
      tier_3: {
        total_amount: prizeDist.tiers['3_MATCH'].totalAmount,
        per_winner: prizeDist.tiers['3_MATCH'].perWinnerAmount,
        winner_count: prizeDist.tiers['3_MATCH'].winnerCount,
        rollover: prizeDist.tiers['3_MATCH'].rolloverAmount,
      },
    },
    total_pool: totalPoolAmount,
    total_payout: prizeDist.totalDistributed,
    total_rollover: prizeDist.totalRollover,
  };
}
