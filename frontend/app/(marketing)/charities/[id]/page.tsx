import { CharityService } from '@/lib/services/charity.service';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { DirectDonationModal } from '@/components/charity/DirectDonationModal';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CharityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let charityData;

  try {
    charityData = await CharityService.getCharityById(id);
  } catch (err) {
    notFound();
  }

  const { charity, events } = charityData;

  return (
    <div className="py-12 md:py-16 mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/charities"
          className="text-xs text-muted-foreground hover:text-white"
        >
          ← Back to All Charities
        </Link>
      </div>

      {/* Main Header & Image */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {charity.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Category: {charity.category}</span>
              {charity.is_featured && <span>• Featured Cause</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DirectDonationModal charityId={charity.id} charityName={charity.name} />
            <Link href="/dashboard/charity">
              <Button size="sm">
                Set as Dedicated Cause
              </Button>
            </Link>
          </div>
        </div>

        {charity.image_url && (
          <div className="h-64 sm:h-80 w-full overflow-hidden rounded border border-border bg-slate-900">
            <img
              src={charity.image_url}
              alt={charity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Details & Total Raised */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white">About the Organization</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {charity.description}
          </p>

          {charity.website_url && (
            <div className="pt-2">
              <a
                href={charity.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-white underline"
              >
                Visit official website
              </a>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t md:border-t-0 md:border-l border-border md:pl-6 pt-4 md:pt-0">
          <div className="text-xs text-muted-foreground uppercase font-semibold">
            Direct Grants Raised
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrency(charity.total_raised || 0)}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Funded automatically through member subscription pools, winning prize pledges, and direct donations.
          </p>
        </div>
      </div>

      {/* Initiatives / Events Section */}
      <div className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-bold text-white">
          Active Initiatives & Golf Days
        </h2>

        {events && events.length > 0 ? (
          <div className="divide-y divide-border border-y border-border">
            {events.map((event) => (
              <div key={event.id} className="py-4 space-y-1">
                <div className="text-xs text-muted-foreground font-mono">
                  {formatDate(event.event_date)}
                </div>
                <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground py-4">
            No upcoming events posted for this charity at this moment.
          </div>
        )}
      </div>
    </div>
  );
}
