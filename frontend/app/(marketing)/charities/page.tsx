import { CharityService } from '@/lib/services/charity.service';
import { CharityCard } from '@/components/charity/CharityCard';
import { APP_CONFIG } from '@/lib/constants';
import Link from 'next/link';

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = 'All', q = '' } = await searchParams;
  let charities: import('@/types/database').Charity[] = [];

  try {
    charities = await CharityService.getCharities(category);
  } catch (err) {
    charities = [];
  }

  const filteredCharities = charities.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.description.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="py-12 md:py-16 mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Partner Charities
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Verified non-profit organizations supported directly through player subscription pools and prize pledges.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        {APP_CONFIG.charityCategories.map((cat) => {
          const isActive = category === cat;
          return (
            <Link
              key={cat}
              href={`/charities?category=${encodeURIComponent(cat)}`}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-muted-foreground hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Charity Cards Grid */}
      {filteredCharities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharities.map((charity) => (
            <CharityCard key={charity.id} charity={charity} />
          ))}
        </div>
      ) : (
        <div className="rounded border border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No charities found in this category.
        </div>
      )}
    </div>
  );
}
