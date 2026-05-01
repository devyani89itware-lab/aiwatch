import Link from 'next/link';

const sections = [
  { href: '/incidents', label: 'Incident Feed' },
  { href: '/news', label: 'AI News' },
  { href: '/tools', label: 'New Tools' },
  { href: '/graveyard', label: 'Graveyard' },
  { href: '/hype', label: 'Hype vs Reality' },
];

const legal = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="text-lg font-bold text-white mb-2">
              AI<span className="text-blue-400">Watch</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Your zero-noise hub for AI incidents, news, tools, and the gap between hype and reality. Updated every 6 hours, fully automated.
            </p>
            <p className="mt-3 text-xs text-slate-700">
              All articles link to original sources. We do not republish full content.
            </p>
          </div>

          {/* Sections */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Sections</div>
            <ul className="space-y-2">
              {sections.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Info</div>
            <ul className="space-y-2">
              {legal.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/devyani89itware-lab/aiwatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  GitHub ↗
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Updated every 6 hours</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-700">
          © {new Date().getFullYear()} AIWatch · Zero ads · Zero fluff · Built with Next.js & Supabase
        </div>
      </div>
    </footer>
  );
}
