import { Winner, WinnerProof, Payout, Profile, Draw } from './database';

export interface WinnerWithDetails extends Winner {
  proof?: WinnerProof | null;
  payout?: Payout | null;
  profile?: Profile;
  draw?: Draw;
}

export interface ReviewProofInput {
  winnerId: string;
  approved: boolean;
  rejectionReason?: string;
}
