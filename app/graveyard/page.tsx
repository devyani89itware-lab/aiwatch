import { supabase } from '@/lib/supabase';
import GraveyardCard from '@/components/GraveyardCard';
import type { GraveyardEntry } from '@/lib/types';

export const revalidate = 3600;

export const metadata = {
  title: 'AI Graveyard',
  description: 'Tracking AI tools and startups that shut down, got acquired, or quietly disappeared. A record of what didn\'t survive the AI hype cycle.',
  openGraph: {
    title: 'AI Graveyard — AIWatch',
    description: 'AI tools and startups that shut down, got acquired, or quietly disappeared.',
  },
};

const SEED_ENTRIES: GraveyardEntry[] = [
  {
    id: '1',
    name: 'Google Stadia',
    description: 'Google\'s cloud gaming platform that used AI for performance. Shut down after failing to gain traction.',
    shutdown_date: '2023-01-18',
    reason: 'shutdown',
    acquired_by: null,
    notes: 'Refunds issued to all players. A cautionary tale in overestimating consumer appetite.',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Inflection AI',
    description: 'Created Pi, a personal AI assistant. Co-founder Mustafa Suleyman and key team moved to Microsoft.',
    shutdown_date: '2024-03-19',
    reason: 'acquired',
    acquired_by: 'Microsoft',
    notes: 'Pi.ai continues under new leadership but the original team effectively acquired by Microsoft.',
    created_at: '2024-03-19',
  },
  {
    id: '3',
    name: 'Character.AI (founding team)',
    description: 'Founders Noam Shazeer and Daniel De Freitas returned to Google. Character.AI continues independently.',
    shutdown_date: '2024-08-02',
    reason: 'acquired',
    acquired_by: 'Google (founders)',
    notes: 'The company itself lives on, but the original founding duo returned to Google in a licensing deal.',
    created_at: '2024-08-02',
  },
  {
    id: '4',
    name: 'Stability AI (original leadership)',
    description: 'Emad Mostaque stepped down as CEO amid controversy. The company restructured significantly.',
    shutdown_date: '2024-03-23',
    reason: 'pivot',
    acquired_by: null,
    notes: 'Company survived but pivoted under new leadership after funding and governance issues.',
    created_at: '2024-03-23',
  },
];

export default async function GraveyardPage() {
  const { data } = await supabase
    .from('graveyard')
    .select('*')
    .order('shutdown_date', { ascending: false });

  const entries = data && data.length > 0 ? (data as GraveyardEntry[]) : SEED_ENTRIES;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">⚰️ AI Graveyard</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Tracking AI tools and startups that shut down, got acquired, or disappeared.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 text-xs text-emerald-400">
          <span>⚡</span>
          <span>Auto-updated every 6 hours via news feeds</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <GraveyardCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
