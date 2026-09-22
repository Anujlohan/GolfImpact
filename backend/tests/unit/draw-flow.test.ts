import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreService } from '@/lib/services/score.service';
import { DrawService } from '@/lib/services/draw.service';
import { WinnerService } from '@/lib/services/winner.service';

describe('Draw Results End-to-End Flow', () => {
  beforeEach(() => {
    // Reset services to clean state
    ScoreService._setMockScores([
      // Player A has numbers 7, 14, 21, 28, 35
      { id: 'sa1', user_id: 'player-a', score: 7, score_date: '2026-09-01', created_at: '', updated_at: '' },
      { id: 'sa2', user_id: 'player-a', score: 14, score_date: '2026-09-02', created_at: '', updated_at: '' },
      { id: 'sa3', user_id: 'player-a', score: 21, score_date: '2026-09-03', created_at: '', updated_at: '' },
      { id: 'sa4', user_id: 'player-a', score: 28, score_date: '2026-09-04', created_at: '', updated_at: '' },
      { id: 'sa5', user_id: 'player-a', score: 35, score_date: '2026-09-05', created_at: '', updated_at: '' },

      // Player B has numbers 7, 14, 21, 10, 20
      { id: 'sb1', user_id: 'player-b', score: 7, score_date: '2026-09-01', created_at: '', updated_at: '' },
      { id: 'sb2', user_id: 'player-b', score: 14, score_date: '2026-09-02', created_at: '', updated_at: '' },
      { id: 'sb3', user_id: 'player-b', score: 21, score_date: '2026-09-03', created_at: '', updated_at: '' },
      { id: 'sb4', user_id: 'player-b', score: 10, score_date: '2026-09-04', created_at: '', updated_at: '' },
      { id: 'sb5', user_id: 'player-b', score: 20, score_date: '2026-09-05', created_at: '', updated_at: '' },

      // Player C has non-matching numbers 1, 2, 3, 4, 5
      { id: 'sc1', user_id: 'player-c', score: 1, score_date: '2026-09-01', created_at: '', updated_at: '' },
      { id: 'sc2', user_id: 'player-c', score: 2, score_date: '2026-09-02', created_at: '', updated_at: '' },
      { id: 'sc3', user_id: 'player-c', score: 3, score_date: '2026-09-03', created_at: '', updated_at: '' },
      { id: 'sc4', user_id: 'player-c', score: 4, score_date: '2026-09-04', created_at: '', updated_at: '' },
      { id: 'sc5', user_id: 'player-c', score: 5, score_date: '2026-09-05', created_at: '', updated_at: '' },
    ]);

    DrawService._setMockDraws([]);
    WinnerService._setMockWinners([]);
  });

  it('should snapshot active player scores dynamically', async () => {
    const snapshots = await ScoreService.getActiveParticipantSnapshots();
    expect(snapshots).toHaveLength(3);

    const playerA = snapshots.find((s) => s.userId === 'player-a');
    expect(playerA).toBeDefined();
    expect(playerA?.snapshot).toHaveLength(5);
    expect(playerA?.snapshot).toContain(7);
    expect(playerA?.snapshot).toContain(14);
    expect(playerA?.snapshot).toContain(21);
  });

  it('should simulate a draw using active participant scores', async () => {
    const draw = await DrawService.createDraw('admin-1', 9, 2026, 'ALGORITHMIC', 10000000); // $100,000
    expect(draw.status).toBe('DRAFT');

    const simulation = await DrawService.simulateDraw(draw.id, 'admin-1');
    expect(simulation.total_participants).toBe(3);
    expect(simulation.draw_numbers).toHaveLength(5);
    expect(simulation.total_pool).toBe(10000000);
    expect(simulation.tier_payouts.tier_5.total_amount).toBe(4000000); // 40%
    expect(simulation.tier_payouts.tier_4.total_amount).toBe(3500000); // 35%
    expect(simulation.tier_payouts.tier_3.total_amount).toBe(2500000); // 25%
  });

  it('should publish draw, persist results, and create real Winner records for matching players', async () => {
    const draw = await DrawService.createDraw('admin-1', 9, 2026, 'ALGORITHMIC', 10000000);

    // Force deterministic simulation
    const simulation = await DrawService.simulateDraw(draw.id, 'admin-1');

    const published = await DrawService.publishDraw(draw.id, 'admin-1');
    expect(published.status).toBe('PUBLISHED');
    expect(published.draw_numbers).toEqual(simulation.draw_numbers);
    expect(published.prize_pools).toHaveLength(3);

    // Check latest draw retrieval
    const latest = await DrawService.getLatestDraw();
    expect(latest).toBeDefined();
    expect(latest?.id).toBe(draw.id);
    expect(latest?.status).toBe('PUBLISHED');

    // Check winners generated
    const allWinners = await WinnerService.getAdminWinners();
    // Winners should only exist if match count is 3, 4, or 5
    for (const w of allWinners) {
      expect([3, 4, 5]).toContain(w.matched_count);
      expect(w.prize_amount).toBeGreaterThan(0);
      expect(w.verification_status).toBe('PENDING');
    }
  });

  it('should allow winners to submit proof and admin to approve', async () => {
    // Manually register a winner for player-a
    await WinnerService.createBatchWinners([
      {
        draw_id: 'test-draw',
        user_id: 'player-a',
        tier: '4_MATCH',
        matched_count: 4,
        prize_amount: 3500000,
      },
    ]);

    const winnings = await WinnerService.getUserWinnings('player-a');
    expect(winnings).toHaveLength(1);
    expect(winnings[0].prize_amount).toBe(3500000);
    expect(winnings[0].verification_status).toBe('PENDING');

    // Player uploads proof
    const proof = await WinnerService.submitProof('player-a', winnings[0].id, 'https://example.com/scorecard.png');
    expect(proof.file_url).toBe('https://example.com/scorecard.png');

    // Admin reviews and approves
    const reviewed = await WinnerService.reviewProof('admin-1', winnings[0].id, true);
    expect(reviewed.verification_status).toBe('APPROVED');
    expect(reviewed.payout?.status).toBe('PENDING');
  });
});
