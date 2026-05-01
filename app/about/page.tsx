import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'What AIWatch is, how it works, and why we built it.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white mb-2">About AIWatch</h1>
      <p className="text-slate-400 mb-10">What this is and how it works.</p>

      <div className="space-y-8 text-sm leading-7 text-slate-300">
        <section>
          <h2 className="text-base font-semibold text-white mb-2">What is AIWatch?</h2>
          <p>
            AIWatch is a zero-cost, fully automated AI news aggregator with one unique feature:
            a dedicated <Link href="/incidents" className="text-blue-400 hover:underline">AI Incident Feed</Link> —
            a tracker for real-world AI failures, attacks, and misuse including deepfake scams,
            prompt injection attacks, data leaks, biased model harms, and more.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">The 5 sections</h2>
          <ul className="space-y-2">
            {[
              ['🚨 AI Incident Feed', 'Auto-fetched from RSS and news feeds, tagged by type, severity, and country.'],
              ["📰 Today's AI News", 'General AI news aggregated from 15+ RSS feeds, updated every 6 hours.'],
              ['🛠 New Tools This Week', 'AI tool launches tracked from Product Hunt and Hacker News.'],
              ['⚰️ AI Graveyard', 'AI tools and startups that shut down, got acquired, or pivoted — manually curated.'],
              ['📊 Hype vs Reality', 'Big AI predictions tracked against what actually happened — manually curated.'],
            ].map(([title, desc]) => (
              <li key={title as string} className="flex gap-3">
                <span className="shrink-0 font-medium text-slate-200">{title}</span>
                <span className="text-slate-500">— {desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">How it works</h2>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li>GitHub Actions runs a fetch script every 6 hours</li>
            <li>Pulls from 15+ RSS feeds, filters and tags content automatically</li>
            <li>Keyword detection identifies incidents and classifies type and severity</li>
            <li>Data stored in Supabase (free tier)</li>
            <li>Frontend reads from Supabase and renders via Next.js on Vercel</li>
            <li>Fully automated — no manual content work except Graveyard and Hype Board (~10 min/week)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Content policy</h2>
          <p className="text-slate-400">
            AIWatch does not republish full articles. Every news item and incident links directly
            to the original source. Summaries are generated from RSS feed descriptions only.
            We respect copyright and source attribution.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Tech stack</h2>
          <p className="text-slate-400">
            Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · GitHub Actions · Vercel.
            All free tier. Zero cost to run.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-slate-800 pt-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
