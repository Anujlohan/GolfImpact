import { requireAuth } from '@/lib/auth/guards';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/dates';

export default async function DashboardProfilePage() {
  const auth = await requireAuth();

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Account & Profile
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage your personal details and account credentials.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-white text-sm">{auth.profile.full_name}</span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Email Address</span>
              <span className="font-semibold text-white text-sm">{auth.email}</span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-semibold text-white text-sm">{formatDate(auth.profile.created_at)}</span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-muted-foreground">Account Role</span>
              <div>
                <Badge variant={auth.isAdmin ? 'gold' : 'secondary'}>
                  {auth.profile.role === 'ADMIN' ? 'ADMINISTRATOR' : 'MEMBER'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
