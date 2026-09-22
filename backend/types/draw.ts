import { Draw, DrawParticipant, DrawResult, PrizePool, Winner, DrawType } from './database';

export interface CreateDrawInput {
  drawMonth: number;
  drawYear: number;
  drawType: DrawType;
  totalPoolAmount: number;
}

export interface DrawWithDetails extends Draw {
  participantsCount?: number;
  winnersCount?: number;
  prizePools?: PrizePool[];
  result?: DrawResult | null;
}
