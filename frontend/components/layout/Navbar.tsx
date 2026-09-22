'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { signOutAction } from '@/actions/auth';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Profile, Subscription } from '@/types/database';

interface NavbarProps {
  user?: Profile | null;
  subscription?: Subscription | null;
}

export function Navbar({ user, subscription }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSubscriber =
    subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/charities', label: 'Charities' },
    { href: '/draw', label: 'Draw Results' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white">
            Digital Heroes
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User / CTA Area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button variant="default" size="sm">
                  Dashboard
                </Button>
              </Link>

              <form action={async () => { await signOutAction(); }}>
                <Button variant="ghost" size="icon" title="Sign Out" className="text-muted-foreground hover:text-white">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="default" size="sm">
                  Join
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-muted-foreground hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-sm text-muted-foreground hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center" size="sm">Dashboard</Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <form action={async () => { await signOutAction(); }}>
                  <Button variant="ghost" className="w-full text-muted-foreground" size="sm">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full" size="sm">Join</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
