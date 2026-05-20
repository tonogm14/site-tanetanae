import React from 'react';

const Ad = ({ size = 'leaderboard', label }) => {
  const dims = {
    leaderboard: { w: '100%', h: 96,  label: '728 × 90 · Leaderboard',   title: 'Tu mensaje aquí' },
    billboard:   { w: '100%', h: 250, label: '970 × 250 · Billboard',    title: 'Anuncio destacado' },
    rectangle:   { w: 300,   h: 250, label: '300 × 250 · Medium Rect.', title: 'Espacio sidebar' },
    halfpage:    { w: 300,   h: 600, label: '300 × 600 · Half page',    title: 'Sticky en sidebar' },
    mobile:      { w: '100%', h: 60,  label: '320 × 50 · Mobile banner', title: 'Banner móvil' },
    native:      { w: '100%', h: 110, label: 'Anuncio nativo · in-feed', title: 'Patrocinado' },
  };
  const d = dims[size] || dims.leaderboard;

  return (
    <div className="tt-ad" style={{ width: d.w, height: d.h, borderRadius: 'var(--tt-r-md)' }}>
      <span className="title">{label || d.title}</span>
      <span className="size">{d.label}</span>
    </div>
  );
};

export default Ad;
