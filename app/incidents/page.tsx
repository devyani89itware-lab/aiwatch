import { supabase } from '@/lib/supabase';
import IncidentCard from '@/components/IncidentCard';
import type { Incident, IncidentType, Severity } from '@/lib/types';

export const revalidate = 3600;

export const metadata = {
  title: 'AI Incident Feed',
  description: 'Real-world AI failures, attacks, deepfakes, data leaks, and misuse — tagged by type, severity, and country. Updated every 6 hours.',
  openGraph: {
    title: 'AI Incident Feed — AIWatch',
    description: 'Tracking real-world AI failures, attacks, deepfakes, and misuse. Tagged by type, severity, and country.',
  },
};

const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low'];

const incidentTypes: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'deepfake', label: 'Deepfake' },
  { value: 'prompt-injection', label: 'Prompt Injection' },
  { value: 'data-leak', label: 'Data Leak' },
  { value: 'bias', label: 'Bias / Discrimination' },
  { value: 'hallucination', label: 'Hallucination' },
  { value: 'attack', label: 'Attack / Exploit' },
  { value: 'scam', label: 'Scam / Fraud' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'privacy', label: 'Privacy Violation' },
  { value: 'other', label: 'Other' },
];

export default async function IncidentsPage() {
  const { data } = await supabase
    .from('incidents')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(100);

  const incidents = (data ?? []) as Incident[];

  const bySeverity = severityOrder.reduce<Record<Severity, Incident[]>>(
    (acc, s) => {
      acc[s] = incidents.filter((i) => i.severity === s);
      return acc;
    },
    { critical: [], high: [], medium: [], low: [] }
  );

  const typeCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    typeCounts[i.incident_type] = (typeCounts[i.incident_type] ?? 0) + 1;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">🚨 AI Incident Feed</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Tracking real-world AI failures, attacks, deepfakes, data leaks, and misuse.
        </p>
      </div>

      {/* Stats bar */}
      <div className="mb-8 flex flex-wrap gap-3">
        {[
          { label: 'Total', count: incidents.length, classes: 'text-slate-400 border-slate-700' },
          { label: 'Critical', count: bySeverity.critical.length, classes: 'text-red-400 border-red-900' },
          { label: 'High', count: bySeverity.high.length, classes: 'text-orange-400 border-orange-900' },
          { label: 'Medium', count: bySeverity.medium.length, classes: 'text-yellow-400 border-yellow-900' },
          { label: 'Low', count: bySeverity.low.length, classes: 'text-green-400 border-green-900' },
        ].map(({ label, count, classes }) => (
          <div
            key={label}
            className={`rounded-lg border px-4 py-2 bg-slate-900 text-center min-w-[80px] ${classes}`}
          >
            <div className="text-xl font-bold">{count}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {incidents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {severityOrder.map((severity) =>
            bySeverity[severity].length > 0 ? (
              <section key={severity}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {severity} severity ({bySeverity[severity].length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bySeverity[severity].map((incident) => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
      <div className="text-4xl mb-4">🛡️</div>
      <h3 className="text-slate-300 font-medium mb-2">No incidents tracked yet</h3>
      <p className="text-sm text-slate-600 max-w-sm mx-auto">
        The incident feed will populate automatically after the GitHub Actions workflow runs for the first time.
        Check the README for setup instructions.
      </p>
    </div>
  );
}
