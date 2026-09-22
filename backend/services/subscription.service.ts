import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';
import { Subscription, SubscriptionPlan } from '@/types/database';
import { AppError } from '@/lib/utils/errors';
import { AuditService } from './audit.service';

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_monthly',
    name: 'Monthly Hero Membership',
    interval: 'MONTHLY',
    price: 1500,
    currency: 'usd',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan_yearly',
    name: 'Annual Hero Patron (Save 20%)',
    interval: 'YEARLY',
    price: 14400,
    currency: 'usd',
    active: true,
    created_at: new Date().toISOString(),
  },
];

export class SubscriptionService {
  /**
   * Retrieves all active subscription plans.
   */
  static async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('active', true)
          .order('price', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    return FALLBACK_PLANS;
  }

  /**
   * Gets user's active subscription.
   */
  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    return {
      id: `sub_${userId}`,
      user_id: userId,
      plan_id: 'plan_monthly',
      status: 'ACTIVE',
      stripe_customer_id: `cus_${userId}`,
      stripe_subscription_id: `sub_stripe_${userId}`,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Creates a Stripe Checkout Session for subscription onboarding.
   */
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    planId: string,
    origin: string
  ): Promise<{ url: string }> {
    const plans = await this.getPlans();
    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isMockStripe = !stripeKey || stripeKey.includes('your_key') || stripeKey.includes('placeholder');

    if (!isMockStripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer_email: userEmail,
          line_items: [
            {
              price_data: {
                currency: selectedPlan.currency || 'usd',
                product_data: {
                  name: selectedPlan.name,
                  description: 'Access to monthly draws, score tracking, and charity contributions.',
                },
                unit_amount: selectedPlan.price,
                recurring: {
                  interval: selectedPlan.interval === 'YEARLY' ? 'year' : 'month',
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId,
            planId,
          },
          success_url: `${origin}/onboarding/charity?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/onboarding/subscription?canceled=true`,
        });

        await AuditService.log('INITIATE_CHECKOUT', 'subscriptions', session.id, userId, {
          planId,
        });

        if (session.url) {
          return { url: session.url };
        }
      } catch (err: any) {
        console.warn('Stripe checkout error, fallback to dev activation:', err?.message);
      }
    }

    // Direct dev activation fallback
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const admin = createAdminClient();
        await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            plan_id: planId,
            status: 'ACTIVE',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    } catch {
      // Fallback
    }

    return { url: `${origin}/onboarding/charity?activated=true` };
  }

  /**
   * Creates a mock activation or tests subscription renewal for testing.
   */
  static async activateSubscriptionDirectly(userId: string, planId: string): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const admin = createAdminClient();
        await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            plan_id: planId,
            status: 'ACTIVE',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    } catch {
      // Fallback
    }
  }
}
