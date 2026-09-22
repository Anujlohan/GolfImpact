import { createClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/utils/errors';
import { Profile, Subscription } from '@/types/database';
import { getLocalSession } from './session';

export interface AuthenticatedContext {
  userId: string;
  email: string;
  profile: Profile;
  subscription: Subscription | null;
  isSubscriber: boolean;
  isAdmin: boolean;
}

/**
 * Validates authenticated user session and fetches profile & active subscription.
 */
export async function requireAuth(): Promise<AuthenticatedContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isMock = !supabaseUrl || supabaseUrl.includes('mock.supabase.co');

  if (!isMock) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const userProfile: Profile = profile || {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Hero',
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: user.user_metadata?.phone || null,
          role: (user.user_metadata?.role as any) || 'USER',
          created_at: user.created_at,
          updated_at: user.created_at,
        };

        // Fetch subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const isSubscriber =
          subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';
        const isAdmin = userProfile.role === 'ADMIN';

        return {
          userId: user.id,
          email: user.email || '',
          profile: userProfile,
          subscription: subscription || null,
          isSubscriber,
          isAdmin,
        };
      }
    } catch {
      // Fall through to local session check
    }
  }

  // Check local session cookie fallback
  const localUser = await getLocalSession();
  if (localUser) {
    const localProfile: Profile = {
      id: localUser.id,
      full_name: localUser.full_name,
      avatar_url: null,
      phone: localUser.phone || null,
      role: localUser.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSub: Subscription = {
      id: `sub_${localUser.id}`,
      user_id: localUser.id,
      plan_id: 'plan_monthly',
      status: 'ACTIVE',
      stripe_customer_id: `cus_${localUser.id}`,
      stripe_subscription_id: `sub_stripe_${localUser.id}`,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      userId: localUser.id,
      email: localUser.email,
      profile: localProfile,
      subscription: mockSub,
      isSubscriber: true,
      isAdmin: localUser.role === 'ADMIN',
    };
  }

  throw new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
}

/**
 * Requires an active subscriber session.
 */
export async function requireSubscriber(): Promise<AuthenticatedContext> {
  const context = await requireAuth();
  if (!context.isSubscriber && !context.isAdmin) {
    throw new AppError(
      'Active subscription required to access this feature.',
      403,
      'SUBSCRIBER_REQUIRED'
    );
  }
  return context;
}

/**
 * Requires admin privileges.
 */
export async function requireAdmin(): Promise<AuthenticatedContext> {
  const context = await requireAuth();
  if (!context.isAdmin) {
    throw new AppError('Administrative privileges required.', 403, 'FORBIDDEN');
  }
  return context;
}
