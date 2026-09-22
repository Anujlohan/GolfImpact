import { Subscription, SubscriptionPlan } from './database';

export interface SubscriptionState {
  subscription: Subscription | null;
  isActive: boolean;
  plan: SubscriptionPlan | null;
}

export interface CheckoutSessionInput {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}
