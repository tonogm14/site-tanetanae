import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const INTERVAL = 8500;

const BreakingBar = ({ items = [] }) => {
  const [idx, setIdx]       = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setIdx(v => (v + 1) % items.length), INTERVAL);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  const raw  = items[idx];
  const item = typeof raw === 'string' ? { title: raw, slug: null } : raw;

  const badge = (
    <span style={{
      background: 'var(--tt-breaking)', color: 'white',
      fontWeight: 700, fontSize: 10, letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3,
      display: 'inline-flex', gap: 6, alignItems: 'center', flexShrink: 0,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'white', animation: 'ttPulse 1.4s infinite',
      }} />
      Última hora
    </span>
  );

  return (
    <div style={{
      background: '#0E1116', color: 'white',
      fontFamily: 'var(--tt-font-sans)', fontSize: 12,
      height: 34, borderBottom: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes tt-marquee {
          0%   { transform: translateX(0); }
          85%  { transform: translateX(-100vw); }
          100% { transform: translateX(-100vw); }
        }
      `}</style>

      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: isMobile ? '0 12px' : '0 40px',
        height: '100%', display: 'flex', alignItems: 'center',
        gap: isMobile ? 8 : 16,
      }}>
        {badge}

        {/* Text area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: 18 }}>
          {isMobile ? (
            /* Mobile: horizontal marquee ticker */
            <div
              key={idx}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center',
                whiteSpace: 'nowrap',
                color: 'rgba(255,255,255,0.92)',
                animation: `tt-marquee ${INTERVAL}ms linear forwards`,
              }}
            >
              {item.slug
                ? <Link to={`/${item.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</Link>
                : item.title
              }
            </div>
          ) : (
            /* Desktop: flip animation */
            items.map((raw2, i) => {
              const o = typeof raw2 === 'string' ? { title: raw2, slug: null } : raw2;
              return (
                <div key={i} style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center',
                  transition: 'opacity 0.35s, transform 0.35s',
                  opacity: i === idx ? 1 : 0,
                  transform: `translateY(${(i - idx) * 12}px)`,
                  color: 'rgba(255,255,255,0.92)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {o.slug
                    ? <Link to={`/${o.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{o.title}</Link>
                    : o.title
                  }
                </div>
              );
            })
          )}
        </div>

        {!isMobile && (
          <span style={{
            fontSize: 10, letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase', flexShrink: 0,
          }}>
            Tucupita, Delta Amacuro · En vivo
          </span>
        )}
      </div>
    </div>
  );
};

export default BreakingBar;
