import { stripe } from './server';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && planId) {
        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            plan_id: planId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'ACTIVE',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_subscription_id' }
        );
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const statusMap: Record<string, string> = {
        active: 'ACTIVE',
        trialing: 'TRIALING',
        past_due: 'PAST_DUE',
        canceled: 'CANCELLED',
        unpaid: 'EXPIRED',
      };

      const dbStatus = statusMap[subscription.status] || 'CANCELLED';

      await supabase
        .from('subscriptions')
        .update({
          status: dbStatus,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}
