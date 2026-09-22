'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const dashboardNavItems = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/scores', label: 'Scores (5 Max)' },
  { href: '/dashboard/charity', label: 'Charity Pledge (≥10%)' },
  { href: '/dashboard/draws', label: 'Draw Participation' },
  { href: '/dashboard/winnings', label: 'Winnings & Proof' },
  { href: '/dashboard/subscription', label: 'Membership' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      <div className="sticky top-20 rounded border border-border bg-card p-3 space-y-1">
        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>
        <nav className="space-y-0.5">
          {dashboardNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-muted-foreground hover:bg-slate-900 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
