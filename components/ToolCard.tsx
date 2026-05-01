import type { Tool } from '@/lib/types';

export default function ToolCard({ tool }: { tool: Tool }) {
  const ago = timeAgo(tool.launched_at);

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-all hover:border-emerald-900/60 hover:bg-slate-800/80">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
            {tool.category}
          </span>
          <span className="text-xs text-slate-600">{ago}</span>
        </div>

        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white">
          {tool.name}
        </h3>

        <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
          {tool.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-700 truncate">{new URL(tool.url).hostname}</span>
          <span className="text-xs text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100">
            Try it →
          </span>
        </div>
      </div>
    </a>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
