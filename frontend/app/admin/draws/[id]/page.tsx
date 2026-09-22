import { requireAdmin } from '@/lib/auth/guards';
import { DrawService } from '@/lib/services/draw.service';
import { AdminNav } from '@/components/layout/AdminNav';
import { DrawSimulationPreview } from '@/components/draws/DrawSimulationPreview';
import { getMonthName } from '@/lib/utils/dates';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AdminDrawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAdmin();
  const { id } = await params;

  const draw = await DrawService.getDrawById(id);

  if (!draw) {
    notFound();
  }

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <Link
            href="/admin/draws"
            className="text-xs text-muted-foreground hover:text-white"
          >
            ← Back to Draws
          </Link>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              {getMonthName(draw.draw_month)} {draw.draw_year} Draw Workspace
            </h1>
            <p className="text-xs text-muted-foreground">
              Pool: {formatCurrency(draw.total_pool_amount)} • Engine: {draw.draw_type}
            </p>
          </div>

          <DrawSimulationPreview draw={draw} />
        </div>
      </div>
    </div>
  );
}
