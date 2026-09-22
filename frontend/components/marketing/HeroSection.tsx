import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DrawCountdown } from '@/components/draws/DrawCountdown';

export function HeroSection({ jackpotAmount = 7500000 }: { jackpotAmount?: number }) {
  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          A transparent lottery funding verified charities.
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
          Submit up to 5 daily scores between 1 and 45. Enter monthly prize draws with verifiable distributions while guaranteeing direct grants to partner charities.
        </p>

        {/* Jackpot Box - Clean & Minimal */}
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Current Monthly Prize Pool
          </div>

          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            ${(jackpotAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-3">Next draw closes in:</div>
            <DrawCountdown />
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/onboarding/subscription" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Start Membership
            </Button>
          </Link>
          <Link href="/how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              How It Works
            </Button>
          </Link>
        </div>

        {/* Key Points - Plain Text */}
        <div className="pt-6 text-xs text-muted-foreground flex flex-wrap justify-center gap-6">
          <span>Deterministic Draw Algorithm</span>
          <span>10% Minimum Charity Contribution</span>
          <span>5 Rolling Scores Maximum</span>
        </div>
      </div>
    </section>
  );
}
