import { supabase } from '@/lib/supabase';
import ToolCard from '@/components/ToolCard';
import type { Tool } from '@/lib/types';

export const revalidate = 3600;

export const metadata = {
  title: 'New AI Tools This Week',
  description: 'Latest AI tool launches tracked automatically from Product Hunt and Hacker News. Updated every 6 hours.',
  openGraph: {
    title: 'New AI Tools This Week — AIWatch',
    description: 'Fresh AI tool launches tracked automatically from Product Hunt and Hacker News.',
  },
};

export default async function ToolsPage() {
  const { data } = await supabase
    .from('tools')
    .select('*')
    .order('launched_at', { ascending: false })
    .limit(60);

  const tools = (data ?? []) as Tool[];

  // Group by week
  const byWeek: Record<string, Tool[]> = {};
  tools.forEach((tool) => {
    const date = new Date(tool.launched_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!byWeek[key]) byWeek[key] = [];
    byWeek[key].push(tool);
  });

  const weeks = Object.keys(byWeek);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">🛠 New AI Tools</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Tracking fresh AI tool launches from Product Hunt, Hacker News, and more.
        </p>
      </div>

      {tools.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {weeks.map((week) => (
            <section key={week}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Week of {week} ({byWeek[week].length} tools)
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {byWeek[week].map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
      <div className="text-4xl mb-4">🔭</div>
      <h3 className="text-slate-300 font-medium mb-2">No tools tracked yet</h3>
      <p className="text-sm text-slate-600 max-w-sm mx-auto">
        AI tool launches populate automatically after the GitHub Actions workflow runs.
      </p>
    </div>
  );
}
