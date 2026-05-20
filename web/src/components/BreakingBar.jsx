import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BreakingBar = ({ items = [] }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const id = setInterval(() => setI(v => (v + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div style={{
      background: '#0E1116',
      color: 'white',
      fontFamily: 'var(--tt-font-sans)',
      fontSize: 12,
      height: 34,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{
        background: 'var(--tt-breaking)',
        color: 'white',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 3,
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'white',
          animation: 'ttPulse 1.4s infinite',
        }} />
        Última hora
      </span>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: 18 }}>
        {items.map((item, idx) => {
          const obj = typeof item === 'string' ? { title: item, slug: null } : item;
          return (
            <div key={idx} style={{
              position: 'absolute',
              inset: 0,
              display: 'flex', alignItems: 'center',
              transition: 'opacity 0.35s, transform 0.35s',
              opacity: idx === i ? 1 : 0,
              transform: `translateY(${(idx - i) * 12}px)`,
              color: 'rgba(255,255,255,0.92)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {obj.slug
                ? <Link to={`/articulo/${obj.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{obj.title}</Link>
                : obj.title
              }
            </div>
          );
        })}
      </div>
      <span style={{
        fontSize: 10, letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        Tucupita, Delta Amacuro · En vivo
      </span>
    </div>
    </div>
  );
};

export default BreakingBar;
