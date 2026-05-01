import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import IncidentCard from '@/components/IncidentCard';
import NewsCard from '@/components/NewsCard';
import type { Incident, NewsItem } from '@/lib/types';

async function getHomeData() {
  const [incidentsRes, newsRes] = await Promise.all([
    supabase
      .from('incidents')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(6),
  ]);

  return {
    incidents: (incidentsRes.data ?? []) as Incident[],
    news: (newsRes.data ?? []) as NewsItem[],
  };
}

const sections = [
  {
    href: '/incidents',
    emoji: '🚨',
    label: 'AI Incident Feed',
    desc: 'Real-world AI failures, attacks & misuse — tagged by type, severity, and country.',
    accent: 'border-red-900/60 hover:border-red-500/40',
    badge: 'text-red-400 bg-red-500/10',
  },
  {
    href: '/news',
    emoji: '📰',
    label: "Today's AI News",
    desc: 'Top AI stories aggregated from 15+ sources, updated every 6 hours.',
    accent: 'border-blue-900/60 hover:border-blue-500/40',
    badge: 'text-blue-400 bg-blue-500/10',
  },
  {
    href: '/tools',
    emoji: '🛠',
    label: 'New Tools This Week',
    desc: 'Fresh AI tool launches tracked automatically from Product Hunt & more.',
    accent: 'border-emerald-900/60 hover:border-emerald-500/40',
    badge: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    href: '/graveyard',
    emoji: '⚰️',
    label: 'AI Graveyard',
    desc: 'AI tools and startups that shut down, got acquired, or quietly disappeared.',
    accent: 'border-purple-900/60 hover:border-purple-500/40',
    badge: 'text-purple-400 bg-purple-500/10',
  },
  {
    href: '/hype',
    emoji: '📊',
    label: 'Hype vs Reality',
    desc: 'Big AI predictions tracked against what actually happened.',
    accent: 'border-amber-900/60 hover:border-amber-500/40',
    badge: 'text-amber-400 bg-amber-500/10',
  },
];

export default async function HomePage() {
  const { incidents, news } = await getHomeData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          AI<span className="text-blue-400">Watch</span>
        </h1>
        <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
          Your zero-noise feed for AI incidents, news, tools, and the gap between hype and reality.
        </p>
        <p className="mt-1 text-sm text-slate-600">Updated every 6 hours · Fully automated</p>
      </div>

      {/* Section cards */}
      <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {sections.map(({ href, emoji, label, desc, accent, badge }) => (
          <Link key={href} href={href} className="group">
            <div className={`h-full rounded-lg border bg-slate-900 p-4 transition-all ${accent}`}>
              <div className="mb-2 text-2xl">{emoji}</div>
              <div className={`mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${badge}`}>
                {label.toUpperCase()}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Latest incidents preview */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            🚨 <span>Latest Incidents</span>
          </h2>
          <Link href="/incidents" className="text-sm text-red-400 hover:text-red-300 transition-colors">
            View all →
          </Link>
        </div>
        {incidents.length === 0 ? (
          <EmptyState message="No incidents yet — check back after the first data fetch." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </section>

      {/* Latest news preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            📰 <span>Today&apos;s AI News</span>
          </h2>
          <Link href="/news" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </Link>
        </div>
        {news.length === 0 ? (
          <EmptyState message="No news yet — check back after the first data fetch." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
