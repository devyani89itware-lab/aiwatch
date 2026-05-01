import { supabase } from '@/lib/supabase';
import ToolFilters from '@/components/ToolFilters';
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
    .limit(100);

  const tools = (data ?? []) as Tool[];
  const categories = Array.from(new Set(tools.map((t) => t.category))).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🛠 New AI Tools</h1>
        <p className="mt-1 text-slate-400 text-sm">
          {tools.length} tools tracked from Product Hunt, Hacker News, and more.
        </p>
      </div>

      {tools.length === 0 ? (
        <EmptyState />
      ) : (
        <ToolFilters tools={tools} categories={categories} />
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
