import React from 'react';

export const SkeletonBlock = ({ width = '100%', height = 20, style = {} }) => (
  <div
    className="tt-skeleton"
    style={{ width, height, borderRadius: 'var(--tt-r-sm)', ...style }}
  />
);

export const SkeletonCard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <SkeletonBlock height={200} style={{ borderRadius: 'var(--tt-r-md)' }} />
    <SkeletonBlock width="60%" height={12} />
    <SkeletonBlock height={24} />
    <SkeletonBlock height={24} width="80%" />
    <SkeletonBlock height={14} width="40%" />
  </div>
);

export const SkeletonRow = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 14, paddingBlock: 14, borderBottom: '1px solid var(--tt-line)' }}>
    <SkeletonBlock height={100} style={{ borderRadius: 6 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SkeletonBlock width="30%" height={10} />
      <SkeletonBlock height={18} />
      <SkeletonBlock width="70%" height={18} />
    </div>
  </div>
);

export const SkeletonHero = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24 }}>
    <SkeletonBlock height={560} style={{ borderRadius: 'var(--tt-r-lg)' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 18, border: '1px solid var(--tt-line)', borderRadius: 'var(--tt-r-lg)' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, flex: 1 }}>
          <SkeletonBlock height={76} style={{ borderRadius: 6 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkeletonBlock width="40%" height={10} />
            <SkeletonBlock height={16} />
            <SkeletonBlock width="70%" height={16} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonCard;
