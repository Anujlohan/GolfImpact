import Link from 'next/link';
import { HeroSection } from '@/components/marketing/HeroSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { CharityCard } from '@/components/charity/CharityCard';
import { DrawCard } from '@/components/draws/DrawCard';
import { Button } from '@/components/ui/Button';
import { CharityService } from '@/lib/services/charity.service';
import { DrawService } from '@/lib/services/draw.service';

export default async function HomePage() {
  let charities: import('@/types/database').Charity[] = [];
  let latestDraw: import('@/types/database').Draw | null = null;

  try {
    charities = await CharityService.getCharities();
    latestDraw = await DrawService.getLatestDraw();
  } catch (err) {
    // Fallback if db offline
  }

  // Fallback demo draw if none published
  const fallbackDraw = latestDraw || {
    id: 'demo-draw',
    draw_month: 8,
    draw_year: 2026,
    draw_type: 'RANDOM' as const,
    status: 'PUBLISHED' as const,
    draw_numbers: [7, 14, 23, 31, 42],
    total_pool_amount: 7500000,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    prize_pools: [
      { id: '1', draw_id: 'demo-draw', tier: '5_MATCH' as const, percentage: 40, amount: 3000000, rollover_amount: 3000000, created_at: '' },
      { id: '2', draw_id: 'demo-draw', tier: '4_MATCH' as const, percentage: 35, amount: 2625000, rollover_amount: 0, created_at: '' },
      { id: '3', draw_id: 'demo-draw', tier: '3_MATCH' as const, percentage: 25, amount: 1875000, rollover_amount: 0, created_at: '' },
    ],
  };

  const featuredCharities = charities.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <HeroSection jackpotAmount={7500000} />

      {/* How it works */}
      <HowItWorksSection />

      {/* Featured Charities Section */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Featured Charities
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Every member pledges at least 10% of their winnings directly to verified non-profit organizations.
              </p>
            </div>

            <Link href="/charities">
              <Button variant="outline" size="sm">
                View All Charities
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCharities.length > 0 ? (
              featuredCharities.map((c) => <CharityCard key={c.id} charity={c} />)
            ) : (
              <div className="col-span-3 text-center py-6 text-muted-foreground text-xs">
                No charities available currently.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Draw */}
      <section className="py-14 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Latest Draw Results
            </h2>
            <p className="text-sm text-muted-foreground">
              Official winning numbers and prize distributions from the most recent draw.
            </p>
          </div>

          <div className="max-w-2xl">
            <DrawCard draw={fallbackDraw} isLatest />
          </div>

          <div>
            <Link href="/draw">
              <Button variant="outline" size="sm">
                View Draw Archive
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean Text */}
      <section className="py-14 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ready to participate?
          </h2>
          <p className="text-sm text-muted-foreground">
            Join members playing daily and directing funds to world-changing initiatives.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding/subscription">
              <Button size="lg">
                Join Digital Heroes
              </Button>
            </Link>
            <Link href="/charities">
              <Button size="lg" variant="outline">
                Browse Charities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
