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

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${config.classes}`}>
          {config.label}
          {entry.acquired_by && ` → ${entry.acquired_by}`}
        </span>
        <span className="text-xs text-slate-600">{date}</span>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-slate-100">⚰️ {entry.name}</h3>

      <p className="mb-2 text-xs leading-relaxed text-slate-500">{entry.description}</p>

      {entry.notes && (
        <p className="text-xs text-slate-600 italic">{entry.notes}</p>
      )}
    </div>
  );
}
