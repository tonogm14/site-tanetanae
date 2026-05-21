import React from 'react';
import Icon from './Icon.jsx';

const WA_URL = import.meta.env.VITE_WHATSAPP_URL || '#';

const WhatsappBox = () => (
  <div style={{
    background: 'var(--tt-green)',
    color: 'white',
    borderRadius: 'var(--tt-r-lg)',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <Icon name="whatsapp" size={36} />
    <h4 style={{
      fontFamily: 'var(--tt-font-display)',
      fontSize: 28, lineHeight: 1, marginTop: 14, marginBottom: 8,
    }}>
      El delta en tu <em>WhatsApp</em>
    </h4>
    <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85, marginBottom: 16 }}>
      Resumen diario a las 7:00 AM. Sin spam, sin grupos. Solo lo importante.
    </p>
    <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{
      background: 'white', color: 'var(--tt-green-deep)',
      padding: '10px 16px', borderRadius: 'var(--tt-r-pill)',
      fontWeight: 600, fontSize: 12, letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      textDecoration: 'none',
    }}>
      Suscribirme <Icon name="arrow" size={12} />
    </a>
    <div style={{
      position: 'absolute', right: -30, bottom: -30, width: 140, height: 140,
      borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
    }} />
  </div>
);

export default WhatsappBox;
