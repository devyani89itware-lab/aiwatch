'use client';

import { useState, useMemo } from 'react';
import IncidentCard from './IncidentCard';
import type { Incident, Severity, IncidentType } from '@/lib/types';

const SEVERITIES: { value: Severity | ''; label: string }[] = [
  { value: '', label: 'All Severities' },
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const TYPES: { value: IncidentType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'deepfake', label: '🎭 Deepfake' },
  { value: 'prompt-injection', label: '💉 Prompt Injection' },
  { value: 'data-leak', label: '🔓 Data Leak' },
  { value: 'bias', label: '⚖️ Bias' },
  { value: 'hallucination', label: '👻 Hallucination' },
  { value: 'attack', label: '⚡ Attack' },
  { value: 'scam', label: '🎣 Scam' },
  { value: 'misinformation', label: '📢 Misinformation' },
  { value: 'privacy', label: '🔍 Privacy' },
  { value: 'other', label: '⚠️ Other' },
];

export default function IncidentFilters({ incidents }: { incidents: Incident[] }) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [type, setType] = useState<IncidentType | ''>('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return incidents.filter((inc) => {
      if (severity && inc.severity !== severity) return false;
      if (type && inc.incident_type !== type) return false;
      if (q && !inc.title.toLowerCase().includes(q) && !inc.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [incidents, query, severity, type]);

  const hasFilters = query || severity || type;

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search incidents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity | '')}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500 transition-colors"
        >
          {SEVERITIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as IncidentType | '')}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500 transition-colors"
        >
          {TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setQuery(''); setSeverity(''); setType(''); }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-4 text-xs text-slate-600">
        {filtered.length === incidents.length
          ? `${incidents.length} incidents`
          : `${filtered.length} of ${incidents.length} incidents`}
      </p>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-10 text-center">
          <p className="text-sm text-slate-600">No incidents match your filters.</p>
          <button
            onClick={() => { setQuery(''); setSeverity(''); setType(''); }}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
