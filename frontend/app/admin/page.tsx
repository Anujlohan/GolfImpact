import { requireAdmin } from '@/lib/auth/guards';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { AdminNav } from '@/components/layout/AdminNav';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const auth = await requireAdmin();
  const kpis = await AnalyticsService.getAdminKPIs();

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <Badge variant="secondary">ADMIN</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Subscriber volume, draw pools, and charity grants overview.
              </p>
            </div>

            <Link href="/admin/draws/create">
              <Button size="sm">
                Create Draw Draft
              </Button>
            </Link>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">Monthly Recurring (MRR)</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {formatCurrency(kpis.mrr)}
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Active recurring subscriptions
              </span>
            </div>

            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">Total Charity Raised</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {formatCurrency(kpis.totalDonationsRaised)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Cumulative grants
              </span>
            </div>

            <div className="rounded border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block font-medium">Active Subscribers</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {kpis.activeSubscribers}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Out of {kpis.totalUsers} registered
              </span>
            </div>
          </div>

          {/* Charts */}
          <AnalyticsCharts
            monthlyData={kpis.monthlyRevenueChart}
            charityData={kpis.charityDistributionChart}
          />

          {/* Fast Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/draws" className="rounded border border-border bg-card p-3 hover:border-slate-600 block">
              <div className="text-xs font-bold text-white">Draw Management</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Simulate & publish</p>
            </Link>

            <Link href="/admin/winners" className="rounded border border-border bg-card p-3 hover:border-slate-600 block">
              <div className="text-xs font-bold text-white">Winner Proofs</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Review claims</p>
            </Link>

            <Link href="/admin/charities" className="rounded border border-border bg-card p-3 hover:border-slate-600 block">
              <div className="text-xs font-bold text-white">Charities & Causes</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Partner non-profits</p>
            </Link>

            <Link href="/admin/users" className="rounded border border-border bg-card p-3 hover:border-slate-600 block">
              <div className="text-xs font-bold text-white">User Directory</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Permissions & roles</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
