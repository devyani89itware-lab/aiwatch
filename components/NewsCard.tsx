import type { NewsItem } from '@/lib/types';

export default function NewsCard({ item }: { item: NewsItem }) {
  const ago = timeAgo(item.published_at);

  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-all hover:border-blue-900/60 hover:bg-slate-800/80">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
            {item.category}
          </span>
          <span className="text-xs text-slate-600">{ago}</span>
        </div>

        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white line-clamp-2">
          {item.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {item.summary}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">{item.source_name}</span>
          <span className="text-xs text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
            Read →
          </span>
        </div>
      </div>
    </a>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
