import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AIWatch — AI News, Incidents & Reality Check',
    short_name: 'AIWatch',
    description: 'Track real-world AI failures, news, tools, graveyard, and hype vs reality. Updated every 6 hours.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      { name: 'AI Incidents', url: '/incidents', description: 'View latest AI incidents' },
      { name: "Today's News", url: '/news', description: 'Latest AI news' },
      { name: 'AI Graveyard', url: '/graveyard', description: 'AI tools that shut down' },
    ],
  };
}
