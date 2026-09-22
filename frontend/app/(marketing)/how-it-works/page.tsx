import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';

export default function HowItWorksPage() {
  const faqs = [
    {
      q: 'How does the rolling 5-score limit work?',
      a: 'Each member can have up to 5 active scores registered (values 1–45). Each score must have a unique date. When inserting a 6th score, our database transaction automatically deletes your oldest score by date, ensuring exactly your 5 most recent scores are used for the monthly draw snapshot.',
    },
    {
      q: 'What are the prize tiers and percentages?',
      a: 'The total monthly prize pool is split across three tiers: 5-Match (40%), 4-Match (35%), and 3-Match (25%). If multiple players match numbers in the same tier, the prize is split equally among winners in that tier.',
    },
    {
      q: 'What happens if no one wins the 5-match jackpot?',
      a: 'If zero players achieve a 5-number match in a given month, 100% of the 5-match tier amount rolls over into the next month’s jackpot pool.',
    },
    {
      q: 'Why is there a mandatory 10% charity contribution?',
      a: 'Every subscriber commits a minimum of 10% (up to 100%) of their winnings directly to a verified charity partner of their choice.',
    },
    {
      q: 'How do winners verify and claim their prizes?',
      a: 'When numbers are drawn, qualifying winners upload a screenshot proof of their game score. Admins review and verify the submission, and dispatches the payout to your account.',
    },
  ];

  return (
    <div className="py-12 md:py-16 space-y-14">
      {/* Title */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How Digital Heroes Works
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Platform mechanics, prize pool distributions, 5-score rolling rules, and verified charity grants.
        </p>
      </div>

      {/* 4 Steps Component */}
      <HowItWorksSection />

      {/* Prize Breakdown Section */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            Prize Tier Allocations
          </h2>
          <p className="text-xs text-muted-foreground">
            Standard distributions across 3 winning tiers.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white">Tier 1: 5-Number Match</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Match all 5 drawn numbers. Split equally if multiple winners. 100% rolls over to next month if zero winners.
              </p>
            </div>
            <div className="text-sm font-bold text-white font-mono shrink-0">40% Pool</div>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white">Tier 2: 4-Number Match</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Match 4 out of 5 drawn numbers. Split equally among all 4-match winners.
              </p>
            </div>
            <div className="text-sm font-bold text-white font-mono shrink-0">35% Pool</div>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white">Tier 3: 3-Number Match</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Match 3 out of 5 drawn numbers. Split equally among all 3-match winners.
              </p>
            </div>
            <div className="text-sm font-bold text-white font-mono shrink-0">25% Pool</div>
          </div>
        </div>
      </div>

      {/* FAQs Section - Plain Text Q&A */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted-foreground">
            Core rules, payout mechanics, and charity commitments.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4 space-y-1">
              <div className="text-sm font-medium text-white">{faq.q}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Link href="/onboarding/subscription">
            <Button size="lg">
              Start Membership
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
