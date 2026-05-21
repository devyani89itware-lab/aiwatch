import type { GraveyardEntry } from '@/lib/types';

const reasonConfig = {
  shutdown: { label: 'Shut Down', classes: 'bg-red-500/10 text-red-400' },
  acquired: { label: 'Acquired', classes: 'bg-purple-500/10 text-purple-400' },
  pivot: { label: 'Pivoted', classes: 'bg-amber-500/10 text-amber-400' },
};

export default function GraveyardCard({ entry }: { entry: GraveyardEntry }) {
  const config = reasonConfig[entry.reason] ?? reasonConfig.shutdown;
  const date = new Date(entry.shutdown_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const acquiredBy = entry.acquired_by
    ? entry.acquired_by.length > 20
      ? entry.acquired_by.slice(0, 20) + '…'
      : entry.acquired_by
    : null;

  const isAutoNote = entry.notes?.startsWith('Auto-detected from:');
  const displayNotes = !isAutoNote && entry.notes ? entry.notes : null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 overflow-hidden">
      <div className="mb-2 flex items-center justify-between gap-2 min-w-0">
        <span className={`shrink-0 max-w-[55%] truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${config.classes}`}>
          {config.label}
          {acquiredBy && ` → ${acquiredBy}`}
        </span>
        <span className="text-xs text-slate-600 shrink-0">{date}</span>
      </div>

      {entry.source_url ? (
        <a
          href={entry.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-1 flex items-start gap-1"
        >
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-purple-400 group-hover:underline transition-colors">
            ⚰️ {entry.name}
          </h3>
          <svg className="mt-0.5 h-3 w-3 shrink-0 text-slate-600 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <h3 className="mb-1 text-sm font-semibold text-slate-100">⚰️ {entry.name}</h3>
      )}

      <p className="mb-2 text-xs leading-relaxed text-slate-500 line-clamp-3">{entry.description}</p>

      {displayNotes && (
        <p className="text-xs text-slate-600 italic line-clamp-2">{displayNotes}</p>
      )}
    </div>
  );
}
