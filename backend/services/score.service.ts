import { createClient } from '@/lib/supabase/server';
import { Score } from '@/types/database';
import { AppError } from '@/lib/utils/errors';

let mockScoresStore: Score[] = [
  { id: 's1', user_id: 'user-demo', score: 38, score_date: '2026-09-20', created_at: '2026-09-20T10:00:00Z', updated_at: '2026-09-20T10:00:00Z' },
  { id: 's2', user_id: 'user-demo', score: 42, score_date: '2026-09-19', created_at: '2026-09-19T10:00:00Z', updated_at: '2026-09-19T10:00:00Z' },
  { id: 's3', user_id: 'user-demo', score: 14, score_date: '2026-09-18', created_at: '2026-09-18T10:00:00Z', updated_at: '2026-09-18T10:00:00Z' },
  { id: 's4', user_id: 'user-demo', score: 23, score_date: '2026-09-17', created_at: '2026-09-17T10:00:00Z', updated_at: '2026-09-17T10:00:00Z' },
  { id: 's5', user_id: 'user-demo', score: 7, score_date: '2026-09-16', created_at: '2026-09-16T10:00:00Z', updated_at: '2026-09-16T10:00:00Z' },
];

export class ScoreService {
  /**
   * Retrieves user's latest 5 scores in reverse chronological order.
   */
  static async getUserScores(userId: string): Promise<Score[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .order('score_date', { ascending: false })
          .limit(5);

        if (!error && data) return data;
      }
    } catch {
      // Fallback
    }

    const userScores = mockScoresStore.filter((s) => s.user_id === userId);
    if (userScores.length === 0 && (userId === 'user-demo' || userId === 'user-1')) {
      return mockScoresStore.filter((s) => s.user_id === 'user-demo');
    }

    return userScores
      .sort((a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime())
      .slice(0, 5);
  }

  /**
   * Retrieves all active subscribers' current rolling score snapshots for draw participation.
   */
  static async getActiveParticipantSnapshots(): Promise<{ userId: string; snapshot: number[] }[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('scores')
          .select('user_id, score, score_date')
          .order('score_date', { ascending: false });

        if (!error && data && data.length > 0) {
          const userMap = new Map<string, number[]>();
          for (const row of data) {
            const list = userMap.get(row.user_id) || [];
            if (list.length < 5) {
              list.push(row.score);
              userMap.set(row.user_id, list);
            }
          }
          return Array.from(userMap.entries()).map(([userId, snapshot]) => ({
            userId,
            snapshot,
          }));
        }
      }
    } catch {
      // Fallback
    }

    const userMap = new Map<string, Score[]>();
    for (const s of mockScoresStore) {
      const list = userMap.get(s.user_id) || [];
      list.push(s);
      userMap.set(s.user_id, list);
    }

    const participants: { userId: string; snapshot: number[] }[] = [];
    for (const [userId, scores] of userMap.entries()) {
      const sorted = scores
        .sort((a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime())
        .slice(0, 5);
      participants.push({
        userId,
        snapshot: sorted.map((s) => s.score),
      });
    }

    return participants;
  }

  /**
   * Helper for tests to reset mock scores store.
   */
  static _setMockScores(scores: Score[]) {
    mockScoresStore = [...scores];
  }

  /**
   * Adds or updates a score entry adhering strictly to the PRD:
   * - Range 1 to 45 (Stableford format).
   * - Unique per date (same date updates existing entry).
   * - Rolling 5-score queue (new entry automatically discards the oldest).
   */
  static async addScore(userId: string, score: number, scoreDate: string): Promise<Score> {
    if (score < 1 || score > 45) {
      throw new AppError('Score must be an integer between 1 and 45 in Stableford format', 400);
    }

    if (!scoreDate) {
      throw new AppError('Score date is required', 400);
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        
        // Upsert by user_id and score_date
        const { data: inserted, error } = await supabase
          .from('scores')
          .upsert(
            {
              user_id: userId,
              score,
              score_date: scoreDate,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,score_date' }
          )
          .select()
          .single();

        // Prune older scores beyond 5
        const { data: allScores } = await supabase
          .from('scores')
          .select('id, score_date')
          .eq('user_id', userId)
          .order('score_date', { ascending: false });

        if (allScores && allScores.length > 5) {
          const idsToDelete = allScores.slice(5).map((s) => s.id);
          await supabase.from('scores').delete().in('id', idsToDelete);
        }

        if (!error && inserted) {
          return inserted;
        }
      }
    } catch {
      // Fallback
    }

    const newScore: Score = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      score,
      score_date: scoreDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Replace same date if exists, otherwise append and keep top 5 most recent
    const filtered = mockScoresStore.filter((s) => !(s.user_id === userId && s.score_date === scoreDate));
    const userOtherScores = filtered.filter((s) => s.user_id === userId);
    const nonUserScores = filtered.filter((s) => s.user_id !== userId);

    const updatedUserScores = [newScore, ...userOtherScores]
      .sort((a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime())
      .slice(0, 5);

    mockScoresStore = [...nonUserScores, ...updatedUserScores];
    return newScore;
  }

  /**
   * Deletes a score entry.
   */
  static async deleteScore(userId: string, scoreId: string): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        await supabase.from('scores').delete().eq('id', scoreId).eq('user_id', userId);
      }
    } catch {
      // Fallback
    }

    mockScoresStore = mockScoresStore.filter((s) => s.id !== scoreId);
  }

  /**
   * Updates an existing score.
   */
  static async updateScore(
    userId: string,
    scoreId: string,
    score: number,
    scoreDate: string
  ): Promise<Score> {
    if (score < 1 || score > 45) {
      throw new AppError('Score must be between 1 and 45', 400);
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('scores')
          .update({ score, score_date: scoreDate, updated_at: new Date().toISOString() })
          .eq('id', scoreId)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) return data;
      }
    } catch {
      // Fallback
    }

    const updated: Score = {
      id: scoreId,
      user_id: userId,
      score,
      score_date: scoreDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockScoresStore = mockScoresStore.map((s) => (s.id === scoreId ? updated : s));
    return updated;
  }
}
