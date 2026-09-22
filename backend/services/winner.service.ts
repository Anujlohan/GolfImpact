import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Winner, WinnerProof, WinnerWithDetails } from '@/types';
import { AppError } from '@/lib/utils/errors';
import { AuditService } from './audit.service';

let mockWinnersStore: WinnerWithDetails[] = [
  {
    id: 'w1111111-1111-1111-1111-111111111111',
    draw_id: 'd1111111-1111-1111-1111-111111111111',
    user_id: 'user-demo',
    tier: '4_MATCH',
    matched_count: 4,
    prize_amount: 525000,
    verification_status: 'APPROVED',
    payout_status: 'PAID',
    created_at: '2026-08-31T20:05:00Z',
    updated_at: '2026-08-31T20:05:00Z',
    proof: {
      id: 'prf-1',
      winner_id: 'w1111111-1111-1111-1111-111111111111',
      file_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      submitted_at: '2026-08-31T21:00:00Z',
      reviewed_at: '2026-09-01T10:00:00Z',
      reviewed_by: 'admin-1',
      rejection_reason: null,
    },
    payout: {
      id: 'pay-1',
      winner_id: 'w1111111-1111-1111-1111-111111111111',
      amount: 525000,
      currency: 'usd',
      status: 'PAID',
      payment_reference: 'STRIPE_TXN_88492048',
      paid_at: '2026-09-02T14:30:00Z',
      created_at: '2026-09-01T12:00:00Z',
    },
    draw: {
      id: 'd1111111-1111-1111-1111-111111111111',
      draw_month: 8,
      draw_year: 2026,
      draw_type: 'RANDOM',
      status: 'PUBLISHED',
      draw_numbers: [7, 14, 23, 31, 42],
      total_pool_amount: 7500000,
      published_at: '2026-08-31T20:00:00Z',
      created_at: '',
      prize_pools: [],
    },
  },
];

export class WinnerService {
  /**
   * Records winners created from a published draw.
   */
  static async createBatchWinners(
    winners: Array<{
      draw_id: string;
      user_id: string;
      tier: '5_MATCH' | '4_MATCH' | '3_MATCH';
      matched_count: number;
      prize_amount: number;
      verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      payout_status?: 'PENDING' | 'PAID' | 'FAILED';
    }>
  ): Promise<WinnerWithDetails[]> {
    const createdList: WinnerWithDetails[] = [];

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const adminSupabase = createAdminClient();
        const rows = winners.map((w) => ({
          draw_id: w.draw_id,
          user_id: w.user_id,
          tier: w.tier,
          matched_count: w.matched_count,
          prize_amount: w.prize_amount,
          verification_status: w.verification_status || 'PENDING',
          payout_status: w.payout_status || 'PENDING',
        }));

        const { data, error } = await adminSupabase
          .from('winners')
          .insert(rows)
          .select('*, proof:winner_proofs(*), payout:payouts(*), draw:draws(*)');

        if (!error && data) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    for (const w of winners) {
      const winnerRecord: WinnerWithDetails = {
        id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        draw_id: w.draw_id,
        user_id: w.user_id,
        tier: w.tier,
        matched_count: w.matched_count,
        prize_amount: w.prize_amount,
        verification_status: w.verification_status || 'PENDING',
        payout_status: w.payout_status || 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockWinnersStore.unshift(winnerRecord);
      createdList.push(winnerRecord);
    }

    return createdList;
  }

  /**
   * Retrieves all winnings for a specific user.
   */
  static async getUserWinnings(userId: string): Promise<WinnerWithDetails[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('winners')
          .select('*, proof:winner_proofs(*), payout:payouts(*), draw:draws(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    return mockWinnersStore
      .filter((w) => w.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Retrieves single winner record by ID.
   */
  static async getWinnerById(winnerId: string): Promise<WinnerWithDetails | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('winners')
          .select('*, proof:winner_proofs(*), payout:payouts(*), profile:profiles(*), draw:draws(*)')
          .eq('id', winnerId)
          .single();

        if (!error && data) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    return mockWinnersStore.find((w) => w.id === winnerId) || null;
  }

  /**
   * User: Submits screenshot proof for a winning draw.
   */
  static async submitProof(userId: string, winnerId: string, fileUrl: string): Promise<WinnerProof> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data: proof, error } = await supabase
          .from('winner_proofs')
          .upsert(
            {
              winner_id: winnerId,
              file_url: fileUrl,
              submitted_at: new Date().toISOString(),
              rejection_reason: null,
            },
            { onConflict: 'winner_id' }
          )
          .select()
          .single();

        if (!error && proof) {
          await supabase
            .from('winners')
            .update({ verification_status: 'PENDING', updated_at: new Date().toISOString() })
            .eq('id', winnerId);

          await AuditService.log('SUBMIT_WINNER_PROOF', 'winner_proofs', proof.id, userId, {
            winnerId,
            fileUrl,
          });

          return proof;
        }
      }
    } catch {
      // Fallback
    }

    const proofRecord: WinnerProof = {
      id: `proof-${Date.now()}`,
      winner_id: winnerId,
      file_url: fileUrl,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      rejection_reason: null,
    };

    mockWinnersStore = mockWinnersStore.map((w) => {
      if (w.id === winnerId) {
        return {
          ...w,
          verification_status: 'PENDING',
          updated_at: new Date().toISOString(),
          proof: proofRecord,
        };
      }
      return w;
    });

    return proofRecord;
  }

  /**
   * Admin: Retrieves all winners across all draws with filter options.
   */
  static async getAdminWinners(statusFilter?: string): Promise<WinnerWithDetails[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        let query = supabase
          .from('winners')
          .select('*, proof:winner_proofs(*), payout:payouts(*), profile:profiles(*), draw:draws(*)')
          .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'ALL') {
          query = query.eq('verification_status', statusFilter);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    if (statusFilter && statusFilter !== 'ALL') {
      return mockWinnersStore.filter((w) => w.verification_status === statusFilter);
    }
    return mockWinnersStore;
  }

  /**
   * Admin: Review and Approve or Reject a winner proof.
   */
  static async reviewProof(
    adminId: string,
    winnerId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<Winner> {
    const verificationStatus = approved ? 'APPROVED' : 'REJECTED';

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const adminSupabase = createAdminClient();
        const { data: winner, error: winnerError } = await adminSupabase
          .from('winners')
          .update({
            verification_status: verificationStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', winnerId)
          .select()
          .single();

        if (!winnerError && winner) {
          await adminSupabase
            .from('winner_proofs')
            .update({
              reviewed_at: new Date().toISOString(),
              reviewed_by: adminId,
              rejection_reason: approved ? null : rejectionReason || 'Screenshot proof rejected.',
            })
            .eq('winner_id', winnerId);

          if (approved) {
            await adminSupabase.from('payouts').insert({
              winner_id: winnerId,
              amount: winner.prize_amount,
              currency: 'usd',
              status: 'PENDING',
            });
          }

          return winner;
        }
      }
    } catch {
      // Fallback
    }

    const mock = mockWinnersStore.find((w) => w.id === winnerId) || mockWinnersStore[0];
    const updatedWinner: WinnerWithDetails = {
      ...mock,
      verification_status: verificationStatus,
      updated_at: new Date().toISOString(),
      proof: mock.proof
        ? {
            ...mock.proof,
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminId,
            rejection_reason: approved ? null : rejectionReason || 'Screenshot proof rejected.',
          }
        : undefined,
      payout: approved
        ? {
            id: `pay-${Date.now()}`,
            winner_id: winnerId,
            amount: mock.prize_amount,
            currency: 'usd',
            status: 'PENDING',
            payment_reference: null,
            paid_at: null,
            created_at: new Date().toISOString(),
          }
        : mock.payout,
    };

    mockWinnersStore = mockWinnersStore.map((w) => (w.id === winnerId ? updatedWinner : w));
    return updatedWinner;
  }

  /**
   * Helper for tests to reset mock winners store.
   */
  static _setMockWinners(winners: WinnerWithDetails[]) {
    mockWinnersStore = [...winners];
  }
}
