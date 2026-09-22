import { requireAdmin } from '@/lib/auth/guards';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { AdminNav } from '@/components/layout/AdminNav';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { formatCurrency } from '@/lib/utils/currency';

export default async function AdminReportsPage() {
  const auth = await requireAdmin();
  const kpis = await AnalyticsService.getAdminKPIs();

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Financial & Grants Analytics
            </h1>
            <p className="text-xs text-muted-foreground">
              Performance metrics on recurring revenue, prize payouts, and charity fund distribution.
            </p>
          </div>

          <AnalyticsCharts
            monthlyData={kpis.monthlyRevenueChart}
            charityData={kpis.charityDistributionChart}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded border border-border bg-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Subscription Revenue Run-rate
              </span>
              <div className="text-xl font-bold text-white">
                {formatCurrency(kpis.mrr * 12)} / yr
              </div>
              <p className="text-[11px] text-muted-foreground">
                Annualized recurring volume.
              </p>
            </div>

            <div className="rounded border border-border bg-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Cumulative Grants Disbursed
              </span>
              <div className="text-xl font-bold text-white">
                {formatCurrency(kpis.totalDonationsRaised)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Allocated to partner charities.
              </p>
            </div>

            <div className="rounded border border-border bg-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Prize Pool Reserve
              </span>
              <div className="text-xl font-bold text-white">
                {formatCurrency(kpis.upcomingPrizePool)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Allocated across 5, 4, and 3-match tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
