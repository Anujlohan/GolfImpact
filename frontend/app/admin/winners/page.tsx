import { requireAdmin } from '@/lib/auth/guards';
import { WinnerService } from '@/lib/services/winner.service';
import { AdminNav } from '@/components/layout/AdminNav';
import { WinnerReviewTable } from '@/components/admin/WinnerReviewTable';
import { Card } from '@/components/ui/Card';

export default async function AdminWinnersPage() {
  const auth = await requireAdmin();
  let winners: import('@/types').WinnerWithDetails[] = [];

  try {
    winners = await WinnerService.getAdminWinners();
  } catch (err) {
    winners = [];
  }

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Winner Claims & Verification
            </h1>
            <p className="text-xs text-muted-foreground">
              Review winner screenshots, approve claims, and process payout references.
            </p>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <WinnerReviewTable winners={winners} />
          </Card>
        </div>
      </div>
    </div>
  );
}
