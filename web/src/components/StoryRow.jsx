import React from 'react';
import { Link } from 'react-router-dom';

const TTImage = ({ tone, aspect = '1x1', style = {} }) => (
  <div
    className={`tt-img tt-img--${tone || 'recientes'} tt-aspect-${aspect}`}
    style={{ width: '100%', ...style }}
  />
);

const StoryRow = ({ story, index, showImage = true }) => {
  const href = story.slug ? `/${story.slug}` : `/${story.id}`;

  return (
    <Link
      to={href}
      className="tt-card-link"
      style={{
        display: 'grid',
        gridTemplateColumns: index !== undefined ? 'auto 1fr' : (showImage ? '100px 1fr' : '1fr'),
        gap: 14,
        paddingBlock: 14,
        borderBottom: '1px solid var(--tt-line)',
        alignItems: 'start',
        textDecoration: 'none',
      }}
    >
      {index !== undefined && (
        <span style={{
          fontFamily: 'var(--tt-font-display)',
          fontStyle: 'italic',
          fontSize: 32,
          fontWeight: 400,
          color: 'var(--tt-green)',
          lineHeight: 0.9,
          width: 30,
          textAlign: 'right',
        }}>{index}</span>
      )}
      {index === undefined && showImage && (
        <div style={{ borderRadius: 6, overflow: 'hidden', width: 100 }}>
          {story.imgUrl ? (
            <img src={story.imgUrl} alt="" style={{ width: 100, height: 100, objectFit: 'cover', display: 'block' }} />
          ) : (
            <TTImage tone={story.img || story.catSlug} aspect="1x1" />
          )}
        </div>
      )}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--tt-font-sans)',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--tt-green)',
          }}>{story.cat}</span>
        </div>
        <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.15 }}>
          {story.title}
        </h4>
      </div>
    </Link>
  );
};

export default StoryRow;
