import { requireSubscriber } from '@/lib/auth/guards';
import { SubscriptionService } from '@/lib/services/subscription.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';

export default async function DashboardSubscriptionPage() {
  const auth = await requireSubscriber();
  const subscription = await SubscriptionService.getUserSubscription(auth.userId);

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Membership & Billing
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage your active subscription plan and billing schedule.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Plan Name</span>
              <span className="font-semibold text-white text-sm">
                {subscription?.plan?.name || 'Hero Pass Membership'}
              </span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Status</span>
              <div>
                <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {subscription?.status || 'ACTIVE'}
                </Badge>
              </div>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Billing Interval</span>
              <span className="font-semibold text-white text-sm">
                {subscription?.plan?.interval || 'MONTHLY'}
              </span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Membership Rate</span>
              <span className="font-semibold text-white text-sm font-mono">
                {formatCurrency(subscription?.plan?.price || 1500)} / {subscription?.plan?.interval === 'YEARLY' ? 'year' : 'month'}
              </span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Renewal Date</span>
              <span className="font-semibold text-white text-sm">
                {subscription?.current_period_end
                  ? formatDate(subscription.current_period_end)
                  : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Your active subscription guarantees eligibility in upcoming monthly draws and fulfills your chosen charity pledge on prizes won.
          </div>
        </div>
      </div>
    </div>
  );
}
