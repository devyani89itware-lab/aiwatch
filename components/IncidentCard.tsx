import Link from 'next/link';
import SeverityBadge from './SeverityBadge';
import type { Incident } from '@/lib/types';

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

export default function IncidentCard({ incident }: { incident: Incident }) {
  const ago = timeAgo(incident.published_at);
  const emoji = typeEmoji[incident.incident_type] ?? '⚠️';

  return (
    <Link href={`/incidents/${incident.slug}`} className="group block">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-all hover:border-red-900/60 hover:bg-slate-800/80">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <SeverityBadge severity={incident.severity} />
            {incident.country && (
              <span className="text-xs text-slate-500">{incident.country}</span>
            )}
          </div>
          <span className="shrink-0 text-xs text-slate-600">{ago}</span>
        </div>

        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white line-clamp-2">
          {incident.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {incident.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {incident.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-600">{incident.source_name}</span>
        </div>
      </div>
    </Link>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
