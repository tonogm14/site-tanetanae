import React from 'react';

const BannerItem = ({ item }) => {
  if (!item?.enabled || !item?.image_url) return null;
  const img = (
    <img
      src={item.image_url}
      alt="Publicidad"
      style={{ width: '100%', display: 'block', borderRadius: 'var(--tt-r-md)' }}
    />
  );
  return item.link_url ? (
    <a href={item.link_url} target={item.new_tab ? '_blank' : '_self'} rel="noopener noreferrer" style={{ display: 'block' }}>
      {img}
    </a>
  ) : img;
};

const BannerSlot = ({ banner, style = {} }) => {
  if (!banner) return null;

  const items = Array.isArray(banner) ? banner : [banner];
  const visible = items.filter(b => b?.enabled && b?.image_url);
  if (visible.length === 0) return null;

  return (
    <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      {visible.map((item, i) => <BannerItem key={i} item={item} />)}
    </div>
  );
};

export default BannerSlot;
