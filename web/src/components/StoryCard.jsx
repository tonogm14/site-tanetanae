import React from 'react';
import { Link } from 'react-router-dom';

const TTImage = ({ tone, aspect = '16x9', style = {} }) => (
  <div
    className={`tt-img tt-img--${tone || 'recientes'} tt-aspect-${aspect}`}
    style={{ width: '100%', ...style }}
  />
);

const StoryCard = ({ story, size = 'md', showExcerpt = true }) => {
  const titleSize = size === 'lg' ? 28 : size === 'sm' ? 17 : 22;
  const href = story.slug ? `/${story.slug}` : `/${story.id}`;

  return (
    <Link to={href} className="tt-card-link" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ borderRadius: 'var(--tt-r-md)', overflow: 'hidden' }}>
        <div className="tt-img__zoom">
          {story.imgUrl ? (
            <img
              src={story.imgUrl}
              alt={story.title}
              style={{
                width: '100%',
                aspectRatio: size === 'lg' ? '3/2' : '16/9',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <TTImage tone={story.img} aspect={size === 'lg' ? '3x2' : '16x9'} />
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--tt-font-sans)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--tt-green)',
        }}>{story.cat || 'Recientes'}</span>
        <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--tt-line-strong)' }} />
        <span className="tt-meta">{story.date}</span>
      </div>
      <h3 className="tt-headline" style={{ fontSize: titleSize, lineHeight: 1.05 }}>
        {story.title}
      </h3>
      {showExcerpt && story.excerpt && size !== 'sm' && (
        <p className="tt-body" style={{ fontSize: 14, color: 'var(--tt-ink-muted)' }}>
          {story.excerpt.length > 80 ? story.excerpt.slice(0, 80).trimEnd() + '…' : story.excerpt}
        </p>
      )}
      {story.author && size !== 'sm' && (
        <span className="tt-meta">Por {story.author}</span>
      )}
    </Link>
  );
};

export default StoryCard;
