import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SeverityBadge from '@/components/SeverityBadge';
import IncidentCard from '@/components/IncidentCard';
import type { Incident } from '@/lib/types';

export const revalidate = 3600;

const typeEmoji: Record<string, string> = {
  deepfake: '🎭',
  'prompt-injection': '💉',
  'data-leak': '🔓',
  bias: '⚖️',
  hallucination: '👻',
  attack: '⚡',
  scam: '🎣',
  misinformation: '📢',
  privacy: '🔍',
  other: '⚠️',
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data } = await supabase
    .from('incidents')
    .select('title, summary')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Incident Not Found — AIWatch' };

  return {
    title: `${data.title} — AIWatch`,
    description: data.summary.slice(0, 160),
  };
}

export default async function IncidentPage({ params }: Props) {
  const { slug } = await params;

  const { data: incident } = await supabase
    .from('incidents')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!incident) notFound();

  const inc = incident as Incident;

  // Fetch related incidents (same type, excluding this one)
  const { data: related } = await supabase
    .from('incidents')
    .select('*')
    .eq('incident_type', inc.incident_type)
    .neq('id', inc.id)
    .order('published_at', { ascending: false })
    .limit(3);

  const relatedIncidents = (related ?? []) as Incident[];
  const emoji = typeEmoji[inc.incident_type] ?? '⚠️';

  const publishedDate = new Date(inc.published_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
        <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/incidents" className="hover:text-slate-400 transition-colors">Incidents</Link>
        <span>/</span>
        <span className="text-slate-500 truncate">{inc.title.slice(0, 40)}…</span>
      </nav>

      {/* Article header */}
      <article>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <SeverityBadge severity={inc.severity} />
          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 capitalize">
            {inc.incident_type.replace('-', ' ')}
          </span>
          {inc.country && (
            <span className="text-xs text-slate-500">📍 {inc.country}</span>
          )}
        </div>

        <h1 className="mb-3 text-2xl font-bold leading-snug text-white sm:text-3xl">
          {inc.title}
        </h1>

        <div className="mb-6 flex items-center gap-3 text-xs text-slate-500">
          <span>{publishedDate}</span>
          <span>·</span>
          <span>Source: {inc.source_name}</span>
        </div>

        {/* Summary box */}
        <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</h2>
          <p className="text-sm leading-7 text-slate-300 whitespace-pre-line">{inc.summary}</p>
        </div>

        {/* Tags */}
        {inc.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tags</h2>
            <div className="flex flex-wrap gap-1.5">
              {inc.tags.map((tag) => (
                <span key={tag} className="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-5">
          <p className="mb-3 text-sm text-slate-400">
            This is an AI-processed summary. For complete reporting, read the original article.
          </p>
          <a
            href={inc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Read Full Article at {inc.source_name} →
          </a>
        </div>
      </article>

      {/* Related incidents */}
      {relatedIncidents.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Related Incidents
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {relatedIncidents.map((r) => (
              <IncidentCard key={r.id} incident={r} />
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link
          href="/incidents"
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back to Incident Feed
        </Link>
      </div>
    </div>
  );
}
