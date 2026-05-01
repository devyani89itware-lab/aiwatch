import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const siteUrl = 'https://aiwatch-eight.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AIWatch — AI News, Incidents & Reality Check',
    template: '%s — AIWatch',
  },
  description:
    'Track real-world AI failures, attacks & misuse. Curated AI news from 15+ sources, new tool launches, AI graveyard, and hype vs reality — updated every 6 hours.',
  keywords: [
    'AI news', 'AI incidents', 'AI safety', 'artificial intelligence',
    'deepfake', 'AI tools', 'AI graveyard', 'AI hype', 'machine learning news',
  ],
  authors: [{ name: 'AIWatch' }],
  openGraph: {
    type: 'website',
    siteName: 'AIWatch',
    title: 'AIWatch — AI News, Incidents & Reality Check',
    description:
      'Track real-world AI failures, attacks & misuse. Curated AI news, new tools, AI graveyard, and hype vs reality — updated every 6 hours.',
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AIWatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIWatch — AI News, Incidents & Reality Check',
    description:
      'Track real-world AI failures, attacks & misuse. Updated every 6 hours.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
