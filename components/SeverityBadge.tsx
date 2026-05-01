import type { Severity } from '@/lib/types';

const config: Record<Severity, { label: string; classes: string }> = {
  critical: { label: 'CRITICAL', classes: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high: { label: 'HIGH', classes: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium: { label: 'MEDIUM', classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: 'LOW', classes: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const { label, classes } = config[severity] ?? config.medium;
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${classes}`}>
      {label}
    </span>
  );
}
