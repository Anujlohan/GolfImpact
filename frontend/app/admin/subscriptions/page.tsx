import { requireAdmin } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminNav } from '@/components/layout/AdminNav';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/dates';

export default async function AdminSubscriptionsPage() {
  const auth = await requireAdmin();
  const supabase = createAdminClient();

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, profile:profiles(*), plan:subscription_plans(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Subscriptions
            </h1>
            <p className="text-xs text-muted-foreground">
              Subscriber memberships and active billing cycles.
            </p>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Stripe ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions && subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-semibold text-white">
                        {sub.profile?.full_name || sub.user_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sub.plan?.name || sub.plan_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.status === 'ACTIVE'
                              ? 'default'
                              : sub.status === 'TRIALING'
                              ? 'gold'
                              : 'destructive'
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(sub.current_period_end)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {sub.stripe_subscription_id || 'direct_sub'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
