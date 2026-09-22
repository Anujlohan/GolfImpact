import { describe, it, expect } from 'vitest';
import { runDrawSimulation } from '@/lib/draw-engine/simulation';

describe('Simulation Sandbox Runner', () => {
  it('should run a complete sandboxed simulation without errors', () => {
    const participants = [
      { userId: 'user-1', snapshot: [7, 14, 21, 28, 35] },
      { userId: 'user-2', snapshot: [1, 2, 3, 4, 5] },
      { userId: 'user-3', snapshot: [10, 20, 30, 40, 45] },
    ];

    const result = runDrawSimulation({
      drawId: 'sim-test-1',
      drawMonth: 9,
      drawYear: 2026,
      drawType: 'RANDOM',
      totalPoolAmount: 5000000,
      participants,
    });

    expect(result.draw_numbers).toHaveLength(5);
    expect(result.total_participants).toBe(3);
    expect(result.total_pool).toBe(5000000);
    expect(result.tier_payouts).toBeDefined();
    expect(result.tier_payouts.tier_5.total_amount).toBe(2000000); // 40%
    expect(result.tier_payouts.tier_4.total_amount).toBe(1750000); // 35%
    expect(result.tier_payouts.tier_3.total_amount).toBe(1250000); // 25%
  });
});
