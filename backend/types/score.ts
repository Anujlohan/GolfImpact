import { Score } from './database';

export interface ScoreInput {
  score: number;
  score_date: string; // YYYY-MM-DD
}

export interface ScoreState {
  scores: Score[];
  maxScores: number; // 5
  remainingSlots: number;
}
