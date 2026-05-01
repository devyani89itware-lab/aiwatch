'use client';

import { useState, useMemo } from 'react';
import NewsCard from './NewsCard';
import type { NewsItem } from '@/lib/types';

const SORTS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
];

function activeSelect(active: boolean) {
  return active
    ? 'border-blue-500 text-white bg-slate-800'
    : 'border-slate-700 text-slate-300 bg-slate-900';
}

export default function NewsFilters({ items, categories }: { items: NewsItem[]; categories: string[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('date-desc');

  const sources = useMemo(
    () => Array.from(new Set(items.map((i) => i.source_name))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let result = items.filter((item) => {
      if (category && item.category !== category) return false;
      if (source && item.source_name !== source) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.summary.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === 'date-asc') result = [...result].sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());

    return result;
  }, [items, query, category, source, sort]);

  const hasFilters = query || category || source;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="text"
          placeholder="Search news..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
          aria-label="Search news"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${activeSelect(!!category)}`}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-label="Filter by source"
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${activeSelect(!!source)}`}
        >
          <option value="">All Sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort order"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none transition-colors"
        >
          {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setQuery(''); setCategory(''); setSource(''); }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mb-4 text-xs text-slate-600">
        {filtered.length === items.length ? `${items.length} stories` : `${filtered.length} of ${items.length} stories`}
        {category && <span className="ml-2 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400">{category}</span>}
        {source && <span className="ml-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400">{source}</span>}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-10 text-center">
          <p className="text-sm text-slate-600">No stories match your filters.</p>
          <button onClick={() => { setQuery(''); setCategory(''); setSource(''); }} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
