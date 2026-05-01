export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-400">AIWatch</span> — Tracking AI news, incidents & the future of AI
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>Updated every 6 hours</span>
            <span>·</span>
            <span>Zero ads · Zero fluff</span>
            <span>·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-700">
          All articles link to original sources. We do not republish full content.
        </p>
      </div>
    </footer>
  );
}
