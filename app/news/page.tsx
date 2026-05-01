import { supabase } from '@/lib/supabase';
import NewsCard from '@/components/NewsCard';
import type { NewsItem } from '@/lib/types';

export const revalidate = 3600;

export const metadata = {
  title: "Today's AI News",
  description: 'AI news aggregated from 15+ trusted sources including TechCrunch, The Verge, VentureBeat, and more. Updated every 6 hours.',
  openGraph: {
    title: "Today's AI News — AIWatch",
    description: 'AI news from 15+ sources, aggregated and updated every 6 hours. No fluff.',
  },
};

export default async function NewsPage() {
  const { data } = await supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(100);

  const items = (data ?? []) as NewsItem[];

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();
  const byCategory: Record<string, NewsItem[]> = {};
  items.forEach((item) => {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📰 Today&apos;s AI News</h1>
        <p className="mt-1 text-slate-400 text-sm">
          {items.length} stories aggregated from 15+ sources · Updated every 6 hours
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : categories.length > 1 ? (
        <div className="space-y-10">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {cat} ({byCategory[cat].length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byCategory[cat].map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
      <div className="text-4xl mb-4">📡</div>
      <h3 className="text-slate-300 font-medium mb-2">Feed is warming up</h3>
      <p className="text-sm text-slate-600 max-w-sm mx-auto">
        News items populate automatically after the GitHub Actions workflow runs for the first time.
      </p>
    </div>
  );
}
