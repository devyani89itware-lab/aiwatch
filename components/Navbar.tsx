'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/incidents', label: 'Incident Feed', accent: 'text-red-400', emoji: '🚨' },
  { href: '/news', label: "Today's News", accent: 'text-blue-400', emoji: '📰' },
  { href: '/tools', label: 'New Tools', accent: 'text-emerald-400', emoji: '🛠' },
  { href: '/graveyard', label: 'Graveyard', accent: 'text-purple-400', emoji: '⚰️' },
  { href: '/hype', label: 'Hype vs Reality', accent: 'text-amber-400', emoji: '📊' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="AIWatch home">
            <span className="text-xl font-bold tracking-tight text-white">
              AI<span className="text-blue-400">Watch</span>
            </span>
            <span className="hidden rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-400 sm:block">
              LIVE
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, accent }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? `${accent} bg-slate-800`
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile nav — emoji + visible label for accessibility */}
          <div className="flex items-center gap-1 md:hidden">
            {links.map(({ href, label, accent, emoji }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-2 py-1.5 text-lg transition-colors ${
                    active ? `${accent} bg-slate-800` : 'text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <span aria-hidden="true">{emoji}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
