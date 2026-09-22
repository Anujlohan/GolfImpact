import { requireAdmin } from '@/lib/auth/guards';
import { DrawService } from '@/lib/services/draw.service';
import { AdminNav } from '@/components/layout/AdminNav';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthName } from '@/lib/utils/dates';
import Link from 'next/link';

export default async function AdminDrawsListPage() {
  const auth = await requireAdmin();
  let draws: import('@/types/database').Draw[] = [];

  try {
    draws = await DrawService.getAdminDraws();
  } catch (err) {
    draws = [];
  }

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">
                Draw Management
              </h1>
              <p className="text-xs text-muted-foreground">
                Configure draws, run simulations, and publish live results.
              </p>
            </div>

            <Link href="/admin/draws/create">
              <Button size="sm">
                Create Draw Draft
              </Button>
            </Link>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Drawn Numbers</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws && draws.length > 0 ? (
                  draws.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-semibold text-white">
                        {getMonthName(d.draw_month)} {d.draw_year}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {d.draw_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-white">
                        {formatCurrency(d.total_pool_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === 'PUBLISHED' || d.status === 'COMPLETED'
                              ? 'default'
                              : d.status === 'SIMULATED'
                              ? 'gold'
                              : 'outline'
                          }
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {d.draw_numbers && d.draw_numbers.length > 0 ? (
                          <div className="flex gap-1">
                            {d.draw_numbers.map((n, i) => (
                              <span
                                key={i}
                                className="h-5 w-5 rounded bg-slate-900 text-[10px] font-bold text-white flex items-center justify-center border border-border"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/draws/${d.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            {d.status === 'PUBLISHED' ? 'Inspect' : 'Simulate & Publish'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                      No draws found. Click "Create Draw Draft" to initialize one.
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
