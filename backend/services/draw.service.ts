import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Draw, DrawParticipant, DrawResult, PrizePool, DrawType, DrawSimulationResult } from '@/types/database';
import { AppError } from '@/lib/utils/errors';
import { runDrawSimulation } from '@/lib/draw-engine/simulation';
import { evaluateAllParticipants } from '@/lib/draw-engine/matching';
import { calculatePrizeDistribution } from '@/lib/draw-engine/prize-pool';
import { generateRandomDrawNumbers } from '@/lib/draw-engine/random';
import { generateAlgorithmicDrawNumbers } from '@/lib/draw-engine/algorithmic';
import { ScoreService } from './score.service';
import { WinnerService } from './winner.service';
import { AuditService } from './audit.service';

let mockDrawsStore: Draw[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    draw_month: 8,
    draw_year: 2026,
    draw_type: 'RANDOM',
    status: 'PUBLISHED',
    draw_numbers: [7, 14, 23, 31, 42],
    total_pool_amount: 7500000,
    published_at: '2026-08-31T20:00:00Z',
    created_at: '2026-08-01T00:00:00Z',
    prize_pools: [
      { id: 'p1', draw_id: 'd1111111-1111-1111-1111-111111111111', tier: '5_MATCH', percentage: 40, amount: 3000000, rollover_amount: 3000000, created_at: '' },
      { id: 'p2', draw_id: 'd1111111-1111-1111-1111-111111111111', tier: '4_MATCH', percentage: 35, amount: 2625000, rollover_amount: 0, created_at: '' },
      { id: 'p3', draw_id: 'd1111111-1111-1111-1111-111111111111', tier: '3_MATCH', percentage: 25, amount: 1875000, rollover_amount: 0, created_at: '' },
    ],
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    draw_month: 7,
    draw_year: 2026,
    draw_type: 'ALGORITHMIC',
    status: 'COMPLETED',
    draw_numbers: [3, 11, 19, 28, 44],
    total_pool_amount: 6000000,
    published_at: '2026-07-31T20:00:00Z',
    created_at: '2026-07-01T00:00:00Z',
    prize_pools: [
      { id: 'p4', draw_id: 'd2222222-2222-2222-2222-222222222222', tier: '5_MATCH', percentage: 40, amount: 2400000, rollover_amount: 2400000, created_at: '' },
      { id: 'p5', draw_id: 'd2222222-2222-2222-2222-222222222222', tier: '4_MATCH', percentage: 35, amount: 2100000, rollover_amount: 0, created_at: '' },
      { id: 'p6', draw_id: 'd2222222-2222-2222-2222-222222222222', tier: '3_MATCH', percentage: 25, amount: 1500000, rollover_amount: 0, created_at: '' },
    ],
  },
];

const mockDrawParticipantsStore = new Map<string, { userId: string; snapshot: number[] }[]>();

export class DrawService {
  static async getLatestDraw(): Promise<Draw | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('draws')
          .select('*, prize_pools(*)')
          .in('status', ['PUBLISHED', 'COMPLETED'])
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) return data;
      }
    } catch {
      // Fallback
    }

    const published = mockDrawsStore
      .filter((d) => d.status === 'PUBLISHED' || d.status === 'COMPLETED')
      .sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return dateB - dateA;
      });

    return published[0] || null;
  }

  static async getDrawHistory(): Promise<Draw[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('draws')
          .select('*, prize_pools(*)')
          .in('status', ['PUBLISHED', 'COMPLETED'])
          .order('published_at', { ascending: false });

        if (!error && data && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }

    return mockDrawsStore
      .filter((d) => d.status === 'PUBLISHED' || d.status === 'COMPLETED')
      .sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return dateB - dateA;
      });
  }

  static async getAdminDraws(): Promise<Draw[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('draws')
          .select('*, prize_pools(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }

    return [...mockDrawsStore].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static async getDrawById(id: string): Promise<Draw | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('draws')
          .select('*, prize_pools(*)')
          .eq('id', id)
          .single();

        if (!error && data) return data;
      }
    } catch {
      // Fallback
    }

    return mockDrawsStore.find((d) => d.id === id) || null;
  }

  static async createDraw(
    adminId: string,
    drawMonth: number,
    drawYear: number,
    drawType: DrawType,
    totalPoolAmount: number
  ): Promise<Draw> {
    // Collect active participant score snapshots from real user rounds
    const participants = await ScoreService.getActiveParticipantSnapshots();

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const adminSupabase = createAdminClient();
        const { data: draw, error: drawError } = await adminSupabase
          .from('draws')
          .insert({
            draw_month: drawMonth,
            draw_year: drawYear,
            draw_type: drawType,
            total_pool_amount: totalPoolAmount,
            status: 'DRAFT',
            created_by: adminId,
          })
          .select()
          .single();

        if (!drawError && draw) {
          if (participants.length > 0) {
            const participantRows = participants.map((p) => ({
              draw_id: draw.id,
              user_id: p.userId,
              score_snapshot: p.snapshot,
              eligible: true,
            }));
            await adminSupabase.from('draw_participants').insert(participantRows);
          }
          return draw;
        }
      }
    } catch {
      // Fallback
    }

    const newDraw: Draw = {
      id: `draw-${Date.now()}`,
      draw_month: drawMonth,
      draw_year: drawYear,
      draw_type: drawType,
      total_pool_amount: totalPoolAmount,
      status: 'DRAFT',
      draw_numbers: [],
      created_by: adminId,
      created_at: new Date().toISOString(),
      prize_pools: [],
    };

    mockDrawParticipantsStore.set(newDraw.id, participants);
    mockDrawsStore.unshift(newDraw);
    return newDraw;
  }

  static async simulateDraw(drawId: string, adminId: string): Promise<DrawSimulationResult> {
    const draw = (await this.getDrawById(drawId)) || mockDrawsStore.find((d) => d.id === drawId);
    if (!draw) {
      throw new AppError('Draw not found', 404);
    }

    // Retrieve active participant snapshots
    let participants = mockDrawParticipantsStore.get(draw.id);
    if (!participants || participants.length === 0) {
      participants = await ScoreService.getActiveParticipantSnapshots();
    }

    // Fallback if no scores entered in system
    if (participants.length === 0) {
      const userScores = await ScoreService.getUserScores('user-demo');
      participants = [
        {
          userId: 'user-demo',
          snapshot: userScores.map((s) => s.score),
        },
      ];
    }

    const simulationResult = runDrawSimulation({
      drawId: draw.id,
      drawMonth: draw.draw_month,
      drawYear: draw.draw_year,
      drawType: draw.draw_type,
      totalPoolAmount: draw.total_pool_amount,
      participants,
    });

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('draws')
          .update({
            status: 'SIMULATED',
            simulation_result: simulationResult,
            draw_numbers: simulationResult.draw_numbers,
          })
          .eq('id', draw.id);
      }
    } catch {
      // Fallback
    }

    mockDrawsStore = mockDrawsStore.map((d) =>
      d.id === draw.id
        ? {
            ...d,
            status: 'SIMULATED',
            simulation_result: simulationResult,
            draw_numbers: simulationResult.draw_numbers,
          }
        : d
    );

    return simulationResult;
  }

  static async publishDraw(drawId: string, adminId: string): Promise<Draw> {
    const draw = (await this.getDrawById(drawId)) || mockDrawsStore.find((d) => d.id === drawId);
    if (!draw) {
      throw new AppError('Draw not found', 404);
    }

    // Retrieve active participant snapshots
    let participants = mockDrawParticipantsStore.get(draw.id);
    if (!participants || participants.length === 0) {
      participants = await ScoreService.getActiveParticipantSnapshots();
    }
    if (participants.length === 0) {
      const userScores = await ScoreService.getUserScores('user-demo');
      participants = [
        {
          userId: 'user-demo',
          snapshot: userScores.map((s) => s.score),
        },
      ];
    }

    // Generate or use simulated winning numbers
    let winningNumbers = draw.simulation_result?.draw_numbers || draw.draw_numbers;
    if (!winningNumbers || winningNumbers.length === 0) {
      if (draw.draw_type === 'ALGORITHMIC') {
        const seed = `publish_${draw.id}_${draw.draw_year}_${draw.draw_month}_${draw.total_pool_amount}`;
        winningNumbers = generateAlgorithmicDrawNumbers({
          participantSnapshots: participants.map((p) => p.snapshot),
          seedString: seed,
        });
      } else {
        winningNumbers = generateRandomDrawNumbers();
      }
    }

    // Evaluate matches for all real participants
    const evaluation = evaluateAllParticipants(participants, winningNumbers);

    const winnerCounts = {
      '5_MATCH': evaluation.tier5Winners.length,
      '4_MATCH': evaluation.tier4Winners.length,
      '3_MATCH': evaluation.tier3Winners.length,
    };

    const prizeDist = calculatePrizeDistribution(draw.total_pool_amount, winnerCounts);

    const prizePools: PrizePool[] = [
      {
        id: `p5-${draw.id}`,
        draw_id: draw.id,
        tier: '5_MATCH',
        percentage: 40,
        amount: prizeDist.tiers['5_MATCH'].totalAmount,
        rollover_amount: prizeDist.tiers['5_MATCH'].rolloverAmount,
        created_at: new Date().toISOString(),
      },
      {
        id: `p4-${draw.id}`,
        draw_id: draw.id,
        tier: '4_MATCH',
        percentage: 35,
        amount: prizeDist.tiers['4_MATCH'].totalAmount,
        rollover_amount: prizeDist.tiers['4_MATCH'].rolloverAmount,
        created_at: new Date().toISOString(),
      },
      {
        id: `p3-${draw.id}`,
        draw_id: draw.id,
        tier: '3_MATCH',
        percentage: 25,
        amount: prizeDist.tiers['3_MATCH'].totalAmount,
        rollover_amount: prizeDist.tiers['3_MATCH'].rolloverAmount,
        created_at: new Date().toISOString(),
      },
    ];

    // Create real Winner records for matching players
    const winnersToCreate = [
      ...evaluation.tier5Winners.map((w) => ({
        draw_id: draw.id,
        user_id: w.userId,
        tier: '5_MATCH' as const,
        matched_count: 5,
        prize_amount: prizeDist.tiers['5_MATCH'].perWinnerAmount,
        verification_status: 'PENDING' as const,
        payout_status: 'PENDING' as const,
      })),
      ...evaluation.tier4Winners.map((w) => ({
        draw_id: draw.id,
        user_id: w.userId,
        tier: '4_MATCH' as const,
        matched_count: 4,
        prize_amount: prizeDist.tiers['4_MATCH'].perWinnerAmount,
        verification_status: 'PENDING' as const,
        payout_status: 'PENDING' as const,
      })),
      ...evaluation.tier3Winners.map((w) => ({
        draw_id: draw.id,
        user_id: w.userId,
        tier: '3_MATCH' as const,
        matched_count: 3,
        prize_amount: prizeDist.tiers['3_MATCH'].perWinnerAmount,
        verification_status: 'PENDING' as const,
        payout_status: 'PENDING' as const,
      })),
    ];

    if (winnersToCreate.length > 0) {
      await WinnerService.createBatchWinners(winnersToCreate);
    }

    const publishedAt = new Date().toISOString();

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('draws')
          .update({
            status: 'PUBLISHED',
            draw_numbers: winningNumbers,
            published_at: publishedAt,
          })
          .eq('id', draw.id);

        await adminSupabase.from('prize_pools').upsert(prizePools);
        await adminSupabase.from('draw_results').upsert({
          draw_id: draw.id,
          winning_numbers: winningNumbers,
          generated_at: publishedAt,
          algorithm_version: draw.draw_type === 'ALGORITHMIC' ? 'v1.0-algorithmic' : 'v1.0-random',
        });

        await AuditService.log('PUBLISH_DRAW', 'draws', draw.id, adminId, {
          winningNumbers,
          totalParticipants: participants.length,
          winnerCounts,
          totalPayout: prizeDist.totalDistributed,
          totalRollover: prizeDist.totalRollover,
        });
      }
    } catch {
      // Fallback
    }

    const publishedDraw: Draw = {
      ...draw,
      status: 'PUBLISHED',
      draw_numbers: winningNumbers,
      published_at: publishedAt,
      prize_pools: prizePools,
    };

    mockDrawsStore = mockDrawsStore.map((d) => (d.id === draw.id ? publishedDraw : d));

    return publishedDraw;
  }

  /**
   * Helper for test suites to reset mock draws store.
   */
  static _setMockDraws(draws: Draw[]) {
    mockDrawsStore = [...draws];
    mockDrawParticipantsStore.clear();
  }
}
