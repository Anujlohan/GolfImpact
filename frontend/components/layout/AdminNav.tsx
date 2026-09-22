'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const adminNavItems = [
  { href: '/admin', label: 'Admin Overview', exact: true },
  { href: '/admin/draws', label: 'Draw Management' },
  { href: '/admin/winners', label: 'Winner Verification' },
  { href: '/admin/charities', label: 'Charities & Events' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/users', label: 'Users Directory' },
  { href: '/admin/reports', label: 'Reports & Analytics' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      <div className="sticky top-20 rounded border border-border bg-card p-3 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Admin Console
          </span>
          <Link
            href="/dashboard"
            className="text-[11px] text-muted-foreground hover:text-white"
          >
            ← Exit
          </Link>
        </div>

        <nav className="space-y-0.5">
          {adminNavItems.map((item) => {
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
