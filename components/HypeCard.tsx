import HypeReactionButtons from '@/components/HypeReactionButtons';
import type { HypeItem } from '@/lib/types';

const statusConfig = {
  pending: { label: 'Pending', icon: '⏳', classes: 'bg-slate-700/50 text-slate-400 border-slate-600' },
  confirmed: { label: 'Confirmed', icon: '✅', classes: 'bg-green-500/10 text-green-400 border-green-500/30' },
  busted: { label: 'Busted', icon: '💥', classes: 'bg-red-500/10 text-red-400 border-red-500/30' },
  partial: { label: 'Partial', icon: '🌗', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
};

export default function HypeCard({ item }: { item: HypeItem }) {
  const config = statusConfig[item.status] ?? statusConfig.pending;
  const predictedDate = new Date(item.predicted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

  return (
    <div className={`rounded-lg border bg-slate-900 p-4 ${config.classes}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${config.classes}`}>
            {config.label.toUpperCase()}
          </span>
        </div>
        <span className="shrink-0 text-xs text-slate-600">{predictedDate}</span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prediction</p>
        <p className="text-sm font-medium text-slate-200 leading-snug">"{item.prediction}"</p>
        <p className="mt-1 text-xs text-slate-500">— {item.predicted_by}</p>
      </div>

      {item.reality && (
        <div className="border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Reality</p>
          <p className="text-sm text-slate-300 leading-snug">{item.reality}</p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {item.verdict_date && (
              <p className="text-xs text-slate-600">
                Verdict: {new Date(item.verdict_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </p>
            )}
            {item.confidence_score != null && (
              <p className="text-xs text-slate-700">· {item.confidence_score}% confidence</p>
            )}
          </div>
        </div>
      )}

      <HypeReactionButtons itemId={item.id} />
    </div>
  );
}
