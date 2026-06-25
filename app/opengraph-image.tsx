import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'AIWatch — AI News, Incidents & Reality Check';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020817',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Grid background effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <span style={{ fontSize: '72px', fontWeight: 800, color: '#ffffff', letterSpacing: '-2px' }}>
            AI
          </span>
          <span style={{ fontSize: '72px', fontWeight: 800, color: '#60a5fa', letterSpacing: '-2px' }}>
            Watch
          </span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: '28px', color: '#94a3b8', textAlign: 'center', maxWidth: '800px', lineHeight: 1.4 }}>
          AI News · Incident Feed · New Tools · Graveyard · Hype vs Reality
        </div>

        {/* Update badge */}
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '999px',
            padding: '10px 24px',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontSize: '18px', color: '#60a5fa', fontWeight: 600 }}>
            Updated every 6 hours · Zero ads · Zero fluff
          </span>
        </div>
      </div>
    ),
    size
  );
}
