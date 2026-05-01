import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AIWatch.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: May 1, 2026</p>

      <div className="space-y-8 text-sm leading-7 text-slate-300">
        <section>
          <h2 className="text-base font-semibold text-white mb-2">No personal data collected</h2>
          <p className="text-slate-400">
            AIWatch does not collect, store, or process any personal information.
            There are no user accounts, no login, no forms, and no tracking of individual users.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">No cookies</h2>
          <p className="text-slate-400">
            AIWatch does not use cookies, local storage, or any client-side tracking mechanisms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">No ads or third-party trackers</h2>
          <p className="text-slate-400">
            There are no advertisements, no analytics scripts, and no third-party tracking pixels on this site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">External links</h2>
          <p className="text-slate-400">
            AIWatch links to external articles and sources. Once you leave this site,
            the privacy policies of those third-party sites apply. We are not responsible
            for their content or data practices.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Hosting</h2>
          <p className="text-slate-400">
            This site is hosted on Vercel. Vercel may collect standard server logs
            (IP addresses, request paths, timestamps) as part of their infrastructure.
            See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Vercel's privacy policy</a> for details.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Content</h2>
          <p className="text-slate-400">
            All news summaries are derived from publicly available RSS feeds.
            Full articles remain on their original sources. AIWatch does not republish
            copyrighted content in full.
          </p>
        </section>
      </div>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">Contact</h2>
          <p className="text-slate-400">
            For any privacy-related questions or requests, contact us at{' '}
            <a href="mailto:devyani89itware@gmail.com" className="text-blue-400 hover:underline">
              devyani89itware@gmail.com
            </a>.
          </p>
        </section>

      <div className="mt-10 border-t border-slate-800 pt-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
