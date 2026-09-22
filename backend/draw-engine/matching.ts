import { PrizeTier } from '@/types/database';

export interface ParticipantMatchResult {
  userId: string;
  matchedCount: number;
  matchedNumbers: number[];
  tier: PrizeTier | null;
}

/**
 * Calculates matching scores for a participant snapshot against winning numbers.
 */
export function calculateParticipantMatch(
  userId: string,
  snapshot: number[],
  winningNumbers: number[]
): ParticipantMatchResult {
  const winningSet = new Set(winningNumbers);
  const matchedNumbers = snapshot.filter((num) => winningSet.has(num));
  const count = matchedNumbers.length;

  let tier: PrizeTier | null = null;
  if (count === 5) tier = '5_MATCH';
  else if (count === 4) tier = '4_MATCH';
  else if (count === 3) tier = '3_MATCH';

  return {
    userId,
    matchedCount: count,
    matchedNumbers,
    tier,
  };
}

/**
 * Evaluates all participants against winning numbers.
 */
export function evaluateAllParticipants(
  participants: { userId: string; snapshot: number[] }[],
  winningNumbers: number[]
): {
  results: ParticipantMatchResult[];
  tier5Winners: ParticipantMatchResult[];
  tier4Winners: ParticipantMatchResult[];
  tier3Winners: ParticipantMatchResult[];
} {
  const results = participants.map((p) =>
    calculateParticipantMatch(p.userId, p.snapshot, winningNumbers)
  );

  return {
    results,
    tier5Winners: results.filter((r) => r.tier === '5_MATCH'),
    tier4Winners: results.filter((r) => r.tier === '4_MATCH'),
    tier3Winners: results.filter((r) => r.tier === '3_MATCH'),
  };
}
