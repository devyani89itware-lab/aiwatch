import Link from 'next/link';
import SeverityBadge from './SeverityBadge';
import { timeAgo } from '@/lib/timeAgo';
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
  const summary = incident.summary.replace(/\s*\[…\]\s*$/, '').replace(/\s*\.\.\.\s*$/, '').trim();

  return (
    <Link href={`/incidents/${incident.slug}`} className="group block">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-all hover:border-red-900/60 hover:bg-slate-800/80 h-full flex flex-col">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">{emoji}</span>
            <SeverityBadge severity={incident.severity} />
            {incident.country && (
              <span className="text-xs text-slate-500">{incident.country}</span>
            )}
          </div>
          <span className="shrink-0 text-xs text-slate-600">{ago}</span>
        </div>

        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white line-clamp-3">
          {incident.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-slate-500 line-clamp-3 flex-1">
          {summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {incident.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
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
