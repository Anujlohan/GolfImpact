import { describe, it, expect } from 'vitest';
import { calculatePrizeDistribution } from '@/lib/draw-engine/prize-pool';

describe('Prize Pool Distribution & Rollover', () => {
  const totalPool = 1000000; // $10,000 in cents

  it('should allocate 40% (5-match), 35% (4-match), and 25% (3-match)', () => {
    const result = calculatePrizeDistribution(totalPool, {
      '5_MATCH': 1,
      '4_MATCH': 2,
      '3_MATCH': 5,
    });

    expect(result.tiers['5_MATCH'].totalAmount).toBe(400000); // $4,000
    expect(result.tiers['4_MATCH'].totalAmount).toBe(350000); // $3,500
    expect(result.tiers['3_MATCH'].totalAmount).toBe(250000); // $2,500

    expect(result.tiers['5_MATCH'].perWinnerAmount).toBe(400000);
    expect(result.tiers['4_MATCH'].perWinnerAmount).toBe(175000); // $3,500 / 2 = $1,750
    expect(result.tiers['3_MATCH'].perWinnerAmount).toBe(50000);  // $2,500 / 5 = $500

    expect(result.totalRollover).toBe(0);
  });

  it('should rollover 5-match tier if 0 winners match 5 numbers', () => {
    const result = calculatePrizeDistribution(totalPool, {
      '5_MATCH': 0, // Zero 5-match winners
      '4_MATCH': 1,
      '3_MATCH': 2,
    });

    expect(result.tiers['5_MATCH'].winnerCount).toBe(0);
    expect(result.tiers['5_MATCH'].perWinnerAmount).toBe(0);
    expect(result.tiers['5_MATCH'].rolloverAmount).toBe(400000); // 40% rolls over

    expect(result.totalRollover).toBe(400000);
    expect(result.totalDistributed).toBe(350000 + 250000);
  });

  it('should handle zero winners across all tiers with full rollover', () => {
    const result = calculatePrizeDistribution(totalPool, {
      '5_MATCH': 0,
      '4_MATCH': 0,
      '3_MATCH': 0,
    });

    expect(result.totalDistributed).toBe(0);
    expect(result.totalRollover).toBe(totalPool);
  });
});
