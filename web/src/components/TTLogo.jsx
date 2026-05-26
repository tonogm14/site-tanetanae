import React from 'react';

const LOGO_URL = import.meta.env.VITE_LOGO_URL?.trim() || '';

const TTLogo = ({ size = 24, inverted = false, monogram = false }) => {
  const ink = inverted ? 'white' : 'var(--tt-ink)';
  const green = 'var(--tt-green-vivid)';

  if (monogram) {
    if (LOGO_URL) {
      return (
        <img src={LOGO_URL} alt="Tane Tanae"
          style={{ height: size, width: 'auto', display: 'block', filter: inverted ? 'brightness(0) invert(1)' : 'none' }} />
      );
    }
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill={ink} />
          <path d="M8 12 H24 M16 12 V22" stroke={green} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M22 18 Q18 22 14 18 T6 18" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6" />
        </svg>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ink }}>
      {LOGO_URL && (
        <img src={LOGO_URL} alt="Tane Tanae"
          style={{ height: size * 1.1, width: 'auto', display: 'block' }} />
      )}
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--tt-font-display)',
          fontStyle: 'italic',
          fontSize: size,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontWeight: 400,
        }}>
          Tane <span style={{ color: green, fontStyle: 'italic' }}>tanae</span>
        </span>
        <span style={{
          fontFamily: 'var(--tt-font-sans)',
          fontSize: Math.max(9, size * 0.32),
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: inverted ? 'rgba(255,255,255,0.6)' : 'var(--tt-ink-faint)',
          position: 'relative',
          top: -2,
        }}>
          Así pasó
        </span>
      </div>
    </div>
  );
};

export default TTLogo;
