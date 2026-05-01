'use client';

import { useState, useMemo } from 'react';
import ToolCard from './ToolCard';
import type { Tool } from '@/lib/types';

export default function ToolFilters({
  tools,
  categories,
}: {
  tools: Tool[];
  categories: string[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tools.filter((tool) => {
      if (category && tool.category !== category) return false;
      if (q && !tool.name.toLowerCase().includes(q) && !tool.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tools, query, category]);

  const hasFilters = query || category;

  // Group filtered tools by week
  const byWeek: Record<string, Tool[]> = {};
  filtered.forEach((tool) => {
    const date = new Date(tool.launched_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!byWeek[key]) byWeek[key] = [];
    byWeek[key].push(tool);
  });

  const weeks = Object.keys(byWeek);

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setQuery(''); setCategory(''); }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="mb-4 text-xs text-slate-600">
        {filtered.length === tools.length
          ? `${tools.length} tools`
          : `${filtered.length} of ${tools.length} tools`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-10 text-center">
          <p className="text-sm text-slate-600">No tools match your filters.</p>
          <button
            onClick={() => { setQuery(''); setCategory(''); }}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
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
