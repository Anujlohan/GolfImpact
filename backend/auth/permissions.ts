import { Profile, UserRole, SubscriptionStatus } from '@/types/database';

export function isAdmin(profile?: Profile | null): boolean {
  return profile?.role === 'ADMIN';
}

export function isActiveSubscriber(status?: SubscriptionStatus | null): boolean {
  return status === 'ACTIVE' || status === 'TRIALING';
}
