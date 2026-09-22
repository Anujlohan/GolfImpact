import { requireAdmin } from '@/lib/auth/guards';
import { CharityService } from '@/lib/services/charity.service';
import { AdminNav } from '@/components/layout/AdminNav';
import { Card } from '@/components/ui/Card';
import { AdminCharityTable } from '@/components/admin/AdminCharityTable';

export default async function AdminCharitiesPage() {
  const auth = await requireAdmin();
  const charities = await CharityService.getCharities();

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Charities & Causes Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Add, edit, and manage non-profit listings and impact fundraising totals.
            </p>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <AdminCharityTable charities={charities} />
          </Card>
        </div>
      </div>
    </div>
  );
}
