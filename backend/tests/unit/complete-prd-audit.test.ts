import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreService } from '@/lib/services/score.service';
import { CharityService } from '@/lib/services/charity.service';
import { DrawService } from '@/lib/services/draw.service';
import { WinnerService } from '@/lib/services/winner.service';
import { SubscriptionService } from '@/lib/services/subscription.service';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { PayoutService } from '@/lib/services/payout.service';

describe('PRD End-to-End System Audit', () => {
  beforeEach(() => {
    // Reset test isolation stores
    ScoreService._setMockScores([]);
    DrawService._setMockDraws([]);
    WinnerService._setMockWinners([]);
  });

  describe('1. Score Management & Rolling 5-Score Queue (§ 05)', () => {
    it('should enforce 1-45 range for Stableford golf scores', async () => {
      await expect(ScoreService.addScore('user-audit-1', 0, '2026-09-01')).rejects.toThrow();
      await expect(ScoreService.addScore('user-audit-1', 46, '2026-09-01')).rejects.toThrow();

      const validScore = await ScoreService.addScore('user-audit-1', 38, '2026-09-01');
      expect(validScore.score).toBe(38);
    });

    it('should update existing score on same date and maintain unique date constraint', async () => {
      await ScoreService.addScore('user-audit-1', 30, '2026-09-01');
      await ScoreService.addScore('user-audit-1', 42, '2026-09-01');

      const scores = await ScoreService.getUserScores('user-audit-1');
      expect(scores).toHaveLength(1);
      expect(scores[0].score).toBe(42);
    });

    it('should prune the oldest score when 6th score is entered (rolling queue)', async () => {
      const dates = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
      for (let i = 0; i < dates.length; i++) {
        await ScoreService.addScore('user-audit-1', 20 + i, dates[i]);
      }

      let scores = await ScoreService.getUserScores('user-audit-1');
      expect(scores).toHaveLength(5);
      expect(scores.map((s) => s.score)).toEqual([24, 23, 22, 21, 20]); // Reverse chronological

      // Add 6th score
      await ScoreService.addScore('user-audit-1', 45, '2026-09-06');
      scores = await ScoreService.getUserScores('user-audit-1');
      expect(scores).toHaveLength(5);
      expect(scores[0].score).toBe(45);
      expect(scores.map((s) => s.score)).not.toContain(20); // Oldest 2026-09-01 dropped
    });
  });

  describe('2. Charity Allocations & Direct Contributions (§ 08)', () => {
    it('should enforce minimum 10% pledge on lottery winnings', async () => {
      const charities = await CharityService.getCharities();
      const charityId = charities[0].id;

      await expect(CharityService.setCharitySelection('user-audit-1', charityId, 5)).rejects.toThrow();
      await expect(CharityService.setCharitySelection('user-audit-1', charityId, 105)).rejects.toThrow();

      const selection = await CharityService.setCharitySelection('user-audit-1', charityId, 25);
      expect(selection.contribution_percentage).toBe(25);
      expect(selection.charity_id).toBe(charityId);
    });

    it('should process direct standalone donations and update charity total raised', async () => {
      const charities = await CharityService.getCharities();
      const charity = charities[0];
      const initialTotal = charity.total_raised || 0;

      const donation = await CharityService.processDirectDonation(
        'user-audit-1',
        charity.id,
        5000, // $50.00 in cents
        'donor@example.com'
      );

      expect(donation.amount).toBe(5000);
      expect(charity.total_raised).toBe(initialTotal + 5000);
    });

    it('should reject invalid direct donations below $1.00', async () => {
      const charities = await CharityService.getCharities();
      await expect(CharityService.processDirectDonation('user-audit-1', charities[0].id, 50)).rejects.toThrow();
    });
  });

  describe('3. Subscription Plans & Onboarding (§ 04, § 10.1)', () => {
    it('should retrieve active subscription plans (Monthly $15 & Annual $144)', async () => {
      const plans = await SubscriptionService.getPlans();
      expect(plans.length).toBeGreaterThanOrEqual(2);

      const monthly = plans.find((p) => p.interval === 'MONTHLY');
      const yearly = plans.find((p) => p.interval === 'YEARLY');
      expect(monthly?.price).toBe(1500);
      expect(yearly?.price).toBe(14400);
    });

    it('should create checkout session or direct dev activation', async () => {
      const session = await SubscriptionService.createCheckoutSession(
        'user-audit-1',
        'audit@example.com',
        'plan_monthly',
        'http://localhost:3000'
      );
      expect(session.url).toBeDefined();
    });
  });

  describe('4. Draw Simulation, Publishing & Winner Calculation (§ 06, § 07, § 09)', () => {
    it('should simulate and publish draw using real players and create real winners', async () => {
      // 1. Setup 2 players with real 5 scores
      // Player 1 has numbers 10, 20, 30, 40, 45
      await ScoreService.addScore('player-1', 10, '2026-09-01');
      await ScoreService.addScore('player-1', 20, '2026-09-02');
      await ScoreService.addScore('player-1', 30, '2026-09-03');
      await ScoreService.addScore('player-1', 40, '2026-09-04');
      await ScoreService.addScore('player-1', 45, '2026-09-05');

      // Player 2 has numbers 1, 2, 3, 4, 5
      await ScoreService.addScore('player-2', 1, '2026-09-01');
      await ScoreService.addScore('player-2', 2, '2026-09-02');
      await ScoreService.addScore('player-2', 3, '2026-09-03');
      await ScoreService.addScore('player-2', 4, '2026-09-04');
      await ScoreService.addScore('player-2', 5, '2026-09-05');

      // 2. Admin creates draw draft
      const draw = await DrawService.createDraw('admin-1', 10, 2026, 'ALGORITHMIC', 5000000); // $50,000 pool
      expect(draw.status).toBe('DRAFT');

      // 3. Admin simulates draw
      const sim = await DrawService.simulateDraw(draw.id, 'admin-1');
      expect(sim.total_participants).toBe(2);
      expect(sim.draw_numbers).toHaveLength(5);
      expect(sim.tier_payouts.tier_5.total_amount).toBe(2000000); // 40%
      expect(sim.tier_payouts.tier_4.total_amount).toBe(1750000); // 35%
      expect(sim.tier_payouts.tier_3.total_amount).toBe(1250000); // 25%

      // 4. Admin publishes draw
      const published = await DrawService.publishDraw(draw.id, 'admin-1');
      expect(published.status).toBe('PUBLISHED');
      expect(published.draw_numbers).toHaveLength(5);

      // 5. Verify latest draw
      const latest = await DrawService.getLatestDraw();
      expect(latest?.id).toBe(draw.id);
    });

    it('should complete winner claim verification and payout lifecycle', async () => {
      // Create winner
      await WinnerService.createBatchWinners([
        {
          draw_id: 'draw-audit-test',
          user_id: 'player-1',
          tier: '3_MATCH',
          matched_count: 3,
          prize_amount: 1250000,
        },
      ]);

      const winnings = await WinnerService.getUserWinnings('player-1');
      expect(winnings).toHaveLength(1);
      expect(winnings[0].verification_status).toBe('PENDING');
      expect(winnings[0].payout_status).toBe('PENDING');

      // Winner submits scorecard screenshot proof
      const proof = await WinnerService.submitProof('player-1', winnings[0].id, 'https://example.com/proof.png');
      expect(proof.file_url).toBe('https://example.com/proof.png');

      // Admin reviews & approves
      const approved = await WinnerService.reviewProof('admin-1', winnings[0].id, true);
      expect(approved.verification_status).toBe('APPROVED');

      // Admin processes payout
      const payout = await PayoutService.processPayout('admin-1', winnings[0].id, 'PAY-TXN-998877');
      expect(payout.status).toBe('PAID');
      expect(payout.payment_reference).toBe('PAY-TXN-998877');
    });
  });

  describe('5. Admin Analytics & KPI Aggregations (§ 11, § 12)', () => {
    it('should aggregate admin dashboard KPIs', async () => {
      const kpis = await AnalyticsService.getAdminKPIs();
      expect(kpis.totalUsers).toBeGreaterThan(0);
      expect(kpis.mrr).toBeGreaterThanOrEqual(0);
      expect(kpis.monthlyRevenueChart).toBeDefined();
      expect(kpis.charityDistributionChart).toBeDefined();
    });
  });
});
