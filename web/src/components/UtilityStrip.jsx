import React from 'react';
import Icon from './Icon.jsx';

const UtilityStrip = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{
      background: 'var(--tt-paper-2)',
      borderBottom: '1px solid var(--tt-line)',
      fontFamily: 'var(--tt-font-sans)',
      fontSize: 11,
      color: 'var(--tt-ink-muted)',
      height: 30,
      letterSpacing: '0.03em',
    }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="location" size={12} stroke={1.8} />
        <strong style={{ color: 'var(--tt-ink)' }}>Tucupita</strong>
        <span style={{ color: 'var(--tt-ink-faint)' }}>· Delta Amacuro</span>
      </span>
      <span style={{ marginInline: 12, color: 'var(--tt-line-strong)' }}>|</span>
      <span>{dateStr}</span>
      <span style={{ marginInline: 12, color: 'var(--tt-line-strong)' }}>|</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        ☀ 32° · sensación 36°
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--tt-breaking)' }}>
          <Icon name="radio" size={12} stroke={1.8} /> En vivo
        </span>
        <span>Radio Fe y Alegría 92.1 FM</span>
      </span>
    </div>
    </div>
  );
};

export default UtilityStrip;
