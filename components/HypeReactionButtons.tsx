'use client';

import { useEffect, useState } from 'react';

type Reaction = 'confirmed' | 'busted' | 'partial';

const buttons: { value: Reaction; label: string; active: string; idle: string }[] = [
  {
    value: 'confirmed',
    label: '✓ Agree',
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    idle: 'text-slate-600 border-slate-700 hover:text-green-400 hover:border-green-500/40',
  },
  {
    value: 'partial',
    label: '〰 Partial',
    active: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    idle: 'text-slate-600 border-slate-700 hover:text-amber-400 hover:border-amber-500/40',
  },
  {
    value: 'busted',
    label: '✕ Disagree',
    active: 'bg-red-500/20 text-red-400 border-red-500/50',
    idle: 'text-slate-600 border-slate-700 hover:text-red-400 hover:border-red-500/40',
  },
];

export default function HypeReactionButtons({ itemId }: { itemId: string }) {
  const key = `hype_vote_${itemId}`;
  const [voted, setVoted] = useState<Reaction | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(key) as Reaction | null;
    if (stored) setVoted(stored);
  }, [key]);

  function handleVote(value: Reaction) {
    if (voted === value) {
      localStorage.removeItem(key);
      setVoted(null);
    } else {
      localStorage.setItem(key, value);
      setVoted(value);
    }
  }

  if (!mounted) return null;

  return (
    <div className="border-t border-slate-800 pt-3 mt-3">
      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Your take</p>
      <div className="flex gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleVote(btn.value)}
            className={`rounded border px-2 py-1 text-[11px] font-medium transition-colors ${
              voted === btn.value ? btn.active : btn.idle
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {voted && (
        <p className="mt-1.5 text-[10px] text-slate-600">
          Saved locally · click again to undo
        </p>
      )}
    </div>
  );
}
