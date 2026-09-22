import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background text-muted-foreground text-xs">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-2">
            <span className="text-sm font-bold text-white">Digital Heroes</span>
            <p className="leading-relaxed">
              Transparent lottery protocol funding verified non-profit partners through player subscription pools.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Platform</h3>
            <ul className="space-y-1.5">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/draw" className="hover:text-white transition-colors">Draw Results</Link></li>
              <li><Link href="/charities" className="hover:text-white transition-colors">Charities</Link></li>
              <li><Link href="/onboarding/subscription" className="hover:text-white transition-colors">Membership</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Key Rules</h3>
            <ul className="space-y-1.5">
              <li>5-score limit per participant</li>
              <li>10% minimum charity pledge</li>
              <li>40% / 35% / 25% prize splits</li>
              <li>Verified screenshot proof</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Account</h3>
            <ul className="space-y-1.5">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Play Responsibly</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
