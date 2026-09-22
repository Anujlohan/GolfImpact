import { APP_CONFIG } from '../constants';
import { PrizeTier } from '@/types/database';

export interface TierAllocation {
  tier: PrizeTier;
  percentage: number;
  totalAmount: number; // in cents
  winnerCount: number;
  perWinnerAmount: number; // in cents
  rolloverAmount: number; // in cents
}

export interface PrizeDistributionResult {
  totalPoolAmount: number; // in cents
  totalDistributed: number; // in cents
  totalRollover: number; // in cents
  tiers: {
    '5_MATCH': TierAllocation;
    '4_MATCH': TierAllocation;
    '3_MATCH': TierAllocation;
  };
}

/**
 * Calculates prize distribution across tiers based on percentages (40/35/25)
 * and rolls over funds if a tier has 0 winners.
 */
export function calculatePrizeDistribution(
  totalPoolAmount: number, // in cents (includes rollover from previous draw)
  winnerCounts: {
    '5_MATCH': number;
    '4_MATCH': number;
    '3_MATCH': number;
  }
): PrizeDistributionResult {
  const p5 = APP_CONFIG.prizeTierPercentages['5_MATCH'] / 100; // 0.40
  const p4 = APP_CONFIG.prizeTierPercentages['4_MATCH'] / 100; // 0.35
  const p3 = APP_CONFIG.prizeTierPercentages['3_MATCH'] / 100; // 0.25

  const amount5 = Math.floor(totalPoolAmount * p5);
  const amount4 = Math.floor(totalPoolAmount * p4);
  const amount3 = Math.floor(totalPoolAmount * p3);

  const count5 = winnerCounts['5_MATCH'];
  const count4 = winnerCounts['4_MATCH'];
  const count3 = winnerCounts['3_MATCH'];

  const tier5: TierAllocation = {
    tier: '5_MATCH',
    percentage: 40,
    totalAmount: amount5,
    winnerCount: count5,
    perWinnerAmount: count5 > 0 ? Math.floor(amount5 / count5) : 0,
    rolloverAmount: count5 === 0 ? amount5 : 0,
  };

  const tier4: TierAllocation = {
    tier: '4_MATCH',
    percentage: 35,
    totalAmount: amount4,
    winnerCount: count4,
    perWinnerAmount: count4 > 0 ? Math.floor(amount4 / count4) : 0,
    rolloverAmount: count4 === 0 ? amount4 : 0,
  };

  const tier3: TierAllocation = {
    tier: '3_MATCH',
    percentage: 25,
    totalAmount: amount3,
    winnerCount: count3,
    perWinnerAmount: count3 > 0 ? Math.floor(amount3 / count3) : 0,
    rolloverAmount: count3 === 0 ? amount3 : 0,
  };

  const totalDistributed =
    tier5.perWinnerAmount * tier5.winnerCount +
    tier4.perWinnerAmount * tier4.winnerCount +
    tier3.perWinnerAmount * tier3.winnerCount;

  const totalRollover = tier5.rolloverAmount + tier4.rolloverAmount + tier3.rolloverAmount;

  return {
    totalPoolAmount,
    totalDistributed,
    totalRollover,
    tiers: {
      '5_MATCH': tier5,
      '4_MATCH': tier4,
      '3_MATCH': tier3,
    },
  };
}
