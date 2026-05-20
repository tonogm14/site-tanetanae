import React from 'react';
import { Link } from 'react-router-dom';

const TTImage = ({ tone, aspect = '4x3', style = {} }) => (
  <div
    className={`tt-img tt-img--${tone || 'recientes'} tt-aspect-${aspect}`}
    style={{ width: '100%', ...style }}
  />
);

const FeatureRow = ({ story }) => {
  const href = story.slug ? `/${story.slug}` : `/${story.id}`;

  return (
    <Link
      to={href}
      className="tt-card-link"
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 20,
        paddingBlock: 18,
        borderBottom: '1px solid var(--tt-line)',
        textDecoration: 'none',
      }}
    >
      <div style={{ borderRadius: 'var(--tt-r-md)', overflow: 'hidden' }}>
        {story.imgUrl ? (
          <img src={story.imgUrl} alt={story.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
        ) : (
          <TTImage tone={story.img} aspect="4x3" />
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="tt-chip" style={{ background: 'var(--tt-ink)' }}>{story.cat}</span>
          <span className="tt-meta">{story.date}</span>
        </div>
        <h3 className="tt-headline" style={{ fontSize: 24, marginBottom: 10 }}>{story.title}</h3>
        {story.excerpt && <p className="tt-body" style={{ fontSize: 14, marginBottom: 10 }}>{story.excerpt}</p>}
        {story.author && <span className="tt-meta">Por {story.author}</span>}
      </div>
    </Link>
  );
};

export default FeatureRow;
