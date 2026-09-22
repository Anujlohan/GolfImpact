export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionInterval = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
export type DrawType = 'RANDOM' | 'ALGORITHMIC';
export type DrawStatus = 'DRAFT' | 'SIMULATED' | 'PUBLISHED' | 'COMPLETED';
export type PrizeTier = '5_MATCH' | '4_MATCH' | '3_MATCH';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PayoutStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: SubscriptionInterval;
  price: number; // in cents
  currency: string;
  active: boolean;
  stripe_price_id?: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  website_url?: string | null;
  category: string;
  total_raised: number; // in cents
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string | null;
  created_at: string;
  charity?: Charity;
}

export interface CharitySelection {
  id: string;
  user_id: string;
  charity_id: string;
  contribution_percentage: number; // >= 10
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export interface Score {
  id: string;
  user_id: string;
  score: number; // 1 - 45
  score_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  draw_month: number; // 1 - 12
  draw_year: number;
  draw_type: DrawType;
  status: DrawStatus;
  draw_numbers: number[];
  simulation_result?: DrawSimulationResult | null;
  total_pool_amount: number; // in cents
  published_at?: string | null;
  created_by?: string | null;
  created_at: string;
  prize_pools?: PrizePool[];
}

export interface DrawParticipant {
  id: string;
  draw_id: string;
  user_id: string;
  score_snapshot: number[];
  eligible: boolean;
  created_at: string;
  profile?: Profile;
}

export interface DrawResult {
  id: string;
  draw_id: string;
  winning_numbers: number[];
  generated_at: string;
  algorithm_version: string;
}

export interface PrizePool {
  id: string;
  draw_id: string;
  tier: PrizeTier;
  percentage: number;
  amount: number; // in cents
  rollover_amount: number; // in cents
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  tier: PrizeTier;
  matched_count: number;
  prize_amount: number; // in cents
  verification_status: VerificationStatus;
  payout_status: PayoutStatus;
  created_at: string;
  updated_at: string;
  proof?: WinnerProof | null;
  profile?: Profile;
  draw?: Draw;
}

export interface WinnerProof {
  id: string;
  winner_id: string;
  file_url: string;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
}

export interface Payout {
  id: string;
  winner_id: string;
  amount: number; // in cents
  currency: string;
  status: PayoutStatus;
  payment_reference?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface Donation {
  id: string;
  charity_id: string;
  user_id?: string | null;
  draw_id?: string | null;
  amount: number; // in cents
  currency: string;
  created_at: string;
  charity?: Charity;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  actor?: Profile;
}

export interface DrawSimulationResult {
  simulated_at: string;
  draw_numbers: number[];
  algorithm_used: DrawType;
  total_participants: number;
  match_counts: {
    tier_5: number;
    tier_4: number;
    tier_3: number;
    no_match: number;
  };
  tier_payouts: {
    tier_5: { total_amount: number; per_winner: number; winner_count: number; rollover: number };
    tier_4: { total_amount: number; per_winner: number; winner_count: number; rollover: number };
    tier_3: { total_amount: number; per_winner: number; winner_count: number; rollover: number };
  };
  total_pool: number;
  total_payout: number;
  total_rollover: number;
}
