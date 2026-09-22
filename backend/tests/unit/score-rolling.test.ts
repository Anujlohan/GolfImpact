import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreService } from '@/lib/services/score.service';

describe('PRD Score Management System (Section 05)', () => {
  const testUser = 'user-prd-test';

  it('retains only the latest 5 scores in rolling order', async () => {
    // Add 6 scores across different dates
    await ScoreService.addScore(testUser, 10, '2026-09-01');
    await ScoreService.addScore(testUser, 15, '2026-09-02');
    await ScoreService.addScore(testUser, 20, '2026-09-03');
    await ScoreService.addScore(testUser, 25, '2026-09-04');
    await ScoreService.addScore(testUser, 30, '2026-09-05');
    
    // 6th score should discard the oldest (2026-09-01)
    await ScoreService.addScore(testUser, 35, '2026-09-06');

    const scores = await ScoreService.getUserScores(testUser);
    expect(scores.length).toBe(5);
    // Oldest date should not be present
    expect(scores.find((s) => s.score_date === '2026-09-01')).toBeUndefined();
    // Most recent score should be present
    expect(scores.find((s) => s.score_date === '2026-09-06')?.score).toBe(35);
  });

  it('updates the score if the same date is entered (duplicate date prevention)', async () => {
    await ScoreService.addScore(testUser, 18, '2026-09-10');
    await ScoreService.addScore(testUser, 22, '2026-09-10'); // same date

    const scores = await ScoreService.getUserScores(testUser);
    const dateEntries = scores.filter((s) => s.score_date === '2026-09-10');
    expect(dateEntries.length).toBe(1);
    expect(dateEntries[0].score).toBe(22);
  });

  it('returns scores in reverse chronological order (most recent first)', async () => {
    const scores = await ScoreService.getUserScores(testUser);
    for (let i = 0; i < scores.length - 1; i++) {
      const currentDate = new Date(scores[i].score_date).getTime();
      const nextDate = new Date(scores[i + 1].score_date).getTime();
      expect(currentDate).toBeGreaterThanOrEqual(nextDate);
    }
  });
});
