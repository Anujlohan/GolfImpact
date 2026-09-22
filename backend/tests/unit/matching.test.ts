import { describe, it, expect } from 'vitest';
import { calculateParticipantMatch, evaluateAllParticipants } from '@/lib/draw-engine/matching';

describe('Match Calculations', () => {
  const winningNumbers = [5, 12, 23, 34, 45];

  it('should identify 5-match (Tier 1)', () => {
    const result = calculateParticipantMatch('user1', [5, 12, 23, 34, 45], winningNumbers);
    expect(result.matchedCount).toBe(5);
    expect(result.tier).toBe('5_MATCH');
  });

  it('should identify 4-match (Tier 2)', () => {
    const result = calculateParticipantMatch('user2', [5, 12, 23, 34, 99], winningNumbers);
    expect(result.matchedCount).toBe(4);
    expect(result.tier).toBe('4_MATCH');
  });

  it('should identify 3-match (Tier 3)', () => {
    const result = calculateParticipantMatch('user3', [5, 12, 23, 88, 99], winningNumbers);
    expect(result.matchedCount).toBe(3);
    expect(result.tier).toBe('3_MATCH');
  });

  it('should categorize <3 matches as null tier', () => {
    const result2 = calculateParticipantMatch('user4', [5, 12, 77, 88, 99], winningNumbers);
    expect(result2.matchedCount).toBe(2);
    expect(result2.tier).toBeNull();

    const result0 = calculateParticipantMatch('user5', [1, 2, 3, 4, 6], winningNumbers);
    expect(result0.matchedCount).toBe(0);
    expect(result0.tier).toBeNull();
  });

  it('should evaluate a batch of participants and group into tiers', () => {
    const participants = [
      { userId: 'u1', snapshot: [5, 12, 23, 34, 45] }, // 5 match
      { userId: 'u2', snapshot: [5, 12, 23, 34, 1] },  // 4 match
      { userId: 'u3', snapshot: [5, 12, 23, 2, 3] },   // 3 match
      { userId: 'u4', snapshot: [1, 2, 3, 4, 6] },      // 0 match
    ];

    const evaluation = evaluateAllParticipants(participants, winningNumbers);

    expect(evaluation.tier5Winners).toHaveLength(1);
    expect(evaluation.tier5Winners[0].userId).toBe('u1');

    expect(evaluation.tier4Winners).toHaveLength(1);
    expect(evaluation.tier4Winners[0].userId).toBe('u2');

    expect(evaluation.tier3Winners).toHaveLength(1);
    expect(evaluation.tier3Winners[0].userId).toBe('u3');
  });
});
