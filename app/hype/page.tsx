import { supabase } from '@/lib/supabase';
import HypeCard from '@/components/HypeCard';
import type { HypeItem, HypeStatus } from '@/lib/types';

export const revalidate = 3600;

export const metadata = {
  title: 'Hype vs Reality Board — AIWatch',
  description: 'Tracking big AI predictions against what actually happened.',
};

const SEED_ITEMS: HypeItem[] = [
  {
    id: '1',
    prediction: 'GPT-4 will pass the bar exam in the top 10% of test takers',
    predicted_by: 'OpenAI (GPT-4 Technical Report)',
    predicted_at: '2023-03-14',
    reality: 'GPT-4 scored in the top 10% on the Uniform Bar Exam — 298/400, exceeding expectations.',
    status: 'confirmed',
    verdict_date: '2023-03-14',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    prediction: 'AI will replace most white-collar jobs within 2 years',
    predicted_by: 'Various tech influencers (2023)',
    predicted_at: '2023-01-01',
    reality: 'White-collar employment remained stable. AI augmented rather than replaced most roles. Some restructuring in tech.',
    status: 'busted',
    verdict_date: '2025-01-01',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    prediction: 'AGI will be achieved by 2025',
    predicted_by: 'Multiple AI researchers and Sam Altman (varies)',
    predicted_at: '2023-06-01',
    reality: 'No AGI achieved as of 2025. Frontier models advanced significantly but fell short of general-purpose reasoning.',
    status: 'busted',
    verdict_date: '2025-04-01',
    created_at: '2024-01-01',
  },
  {
    id: '4',
    prediction: 'Self-driving cars will be mainstream by 2023',
    predicted_by: 'Elon Musk (Tesla, 2019)',
    predicted_at: '2019-04-22',
    reality: 'Full self-driving remained in limited beta. Waymo expanded robotaxi in select cities. Not mainstream.',
    status: 'busted',
    verdict_date: '2024-01-01',
    created_at: '2024-01-01',
  },
  {
    id: '5',
    prediction: 'Multimodal AI assistants will handle complex multi-step tasks autonomously by 2024',
    predicted_by: 'Various AI labs',
    predicted_at: '2023-09-01',
    reality: 'Partial success — models like Claude and GPT-4 can handle multi-step tasks but remain unreliable for complex autonomous workflows.',
    status: 'partial',
    verdict_date: '2025-01-01',
    created_at: '2024-01-01',
  },
  {
    id: '6',
    prediction: 'Open-source AI models will match GPT-4 capability within 12 months',
    predicted_by: 'Open-source community (2023)',
    predicted_at: '2023-04-01',
    reality: 'Llama 3, Mistral, and others closed the gap significantly. By late 2024, open models rivaled GPT-4 on many benchmarks.',
    status: 'confirmed',
    verdict_date: '2024-12-01',
    created_at: '2024-01-01',
  },
];

const statusOrder: HypeStatus[] = ['pending', 'confirmed', 'partial', 'busted'];
const statusLabels: Record<HypeStatus, string> = {
  pending: '⏳ Pending Verdict',
  confirmed: '✅ Confirmed',
  partial: '🌗 Partially True',
  busted: '💥 Busted',
};

export default async function HypePage() {
  const { data } = await supabase
    .from('hype_items')
    .select('*')
    .order('predicted_at', { ascending: false });

  const items = data && data.length > 0 ? (data as HypeItem[]) : SEED_ITEMS;

  const byStatus: Record<HypeStatus, HypeItem[]> = {
    pending: [],
    confirmed: [],
    partial: [],
    busted: [],
  };
  items.forEach((item) => {
    byStatus[item.status]?.push(item);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📊 Hype vs Reality Board</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Big AI predictions tracked against what actually happened.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded border border-amber-900/50 bg-amber-950/20 px-3 py-1 text-xs text-amber-400">
          <span>✏️</span>
          <span>Manually curated — updated weekly</span>
        </div>
      </div>

      {/* Score summary */}
      <div className="mb-8 flex flex-wrap gap-3">
        {statusOrder.map((status) => (
          <div
            key={status}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-center min-w-[90px]"
          >
            <div className="text-xl font-bold text-slate-200">{byStatus[status].length}</div>
            <div className="text-xs text-slate-500">{statusLabels[status]}</div>
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {statusOrder.map((status) =>
          byStatus[status].length > 0 ? (
            <section key={status}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {statusLabels[status]} ({byStatus[status].length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byStatus[status].map((item) => (
                  <HypeCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null
        )}
      </div>
    </div>
  );
}
