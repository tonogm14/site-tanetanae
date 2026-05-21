import React from 'react';

const BannerSlot = ({ banner, style = {} }) => {
  if (!banner?.enabled || !banner?.image_url) return null;

  const img = (
    <img
      src={banner.image_url}
      alt="Publicidad"
      style={{ width: '100%', display: 'block', borderRadius: 'var(--tt-r-md)' }}
    />
  );

  return (
    <div style={{ margin: '24px 0', ...style }}>
      {banner.link_url ? (
        <a
          href={banner.link_url}
          target={banner.new_tab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          style={{ display: 'block' }}
        >
          {img}
        </a>
      ) : img}
    </div>
  );
};

export default BannerSlot;
