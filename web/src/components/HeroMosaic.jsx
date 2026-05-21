import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { prefetchPost } from '../api/wordpress.js';

/* ── Image placeholder or real photo ── */
const CardImage = ({ story }) => (
  story.imgUrl
    ? <img src={story.imgUrl} alt={story.title}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.45s ease' }} className="tt-hero-img" />
    : <div
        style={{ position: 'absolute', inset: 0, transition: 'transform 0.45s ease' }}
        className={`tt-img tt-img--${story.img || 'recientes'} tt-hero-img`} />
);

/* ── Large card (top row) ── */
const LargeCard = ({ story }) => {
  const timer = useRef(null);
  return (
  <Link
    to={`/${story.slug || story.id}`}
    state={{ preview: story }}
    onMouseEnter={() => { timer.current = setTimeout(() => prefetchPost(story.slug), 120); }}
    onMouseLeave={() => clearTimeout(timer.current)}
    style={{ display: 'block', borderRadius: 'var(--tt-r-lg)', overflow: 'hidden',
      position: 'relative', background: 'var(--tt-ink)', color: 'white', height: '100%' }}
    className="tt-hero-card"
  >
    <CardImage story={story} />

    {/* Gradient overlay — darker at bottom */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.82) 100%)',
    }} />

    {/* Content */}
    <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '24px 28px' }}>
      <span className="tt-chip" style={{ marginBottom: 12, display: 'inline-flex' }}>
        {story.cat}
      </span>
      <h2 className="tt-headline" style={{
        fontSize: 'clamp(20px, 2vw, 30px)', lineHeight: 1.06,
        color: 'white', marginBottom: 10,
        display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {story.title}
      </h2>
      {story.excerpt && (
        <p style={{
          fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.75)',
          marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {story.excerpt}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.6)', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>Por {story.author}</span>
        <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.4)' }} />
        <span>{story.date}</span>
        {story.readTime && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.4)' }} />
            <span>{story.readTime}</span>
          </>
        )}
      </div>
    </div>
  </Link>
  );
};

/* ── Small card (bottom row) ── */
const SmallCard = ({ story }) => {
  const timer = useRef(null);
  return (
  <Link
    to={`/${story.slug || story.id}`}
    state={{ preview: story }}
    onMouseEnter={() => { timer.current = setTimeout(() => prefetchPost(story.slug), 120); }}
    onMouseLeave={() => clearTimeout(timer.current)}
    style={{ display: 'block', borderRadius: 'var(--tt-r-md)', overflow: 'hidden',
      position: 'relative', background: 'var(--tt-ink)', color: 'white', height: '100%' }}
    className="tt-hero-card"
  >
    <CardImage story={story} />

    {/* Stronger gradient — smaller card needs more contrast */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.88) 100%)',
    }} />

    {/* Content */}
    <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '16px 18px' }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
        padding: '3px 8px', borderRadius: 'var(--tt-r-pill)',
        background: 'var(--tt-green)', color: 'white',
        display: 'inline-block', marginBottom: 8,
      }}>
        {story.cat}
      </span>
      <h3 className="tt-headline" style={{
        fontSize: 'clamp(17px, 1.5vw, 22px)', lineHeight: 1.1, color: 'white',
        display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {story.title}
      </h3>
      <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
        {story.date}
      </div>
    </div>
  </Link>
  );
};

/* ── Skeleton placeholder while loading ── */
const SkeletonCard = ({ height }) => (
  <div style={{
    height, borderRadius: 'var(--tt-r-lg)', overflow: 'hidden',
    background: 'var(--tt-paper-2)',
    animation: 'ttSkeletonPulse 1.6s ease-in-out infinite',
  }} />
);

/* ── Main mosaic component ── */
const HeroMosaic = ({ stories = [], loading = false }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 360 }}>
          <SkeletonCard height="100%" />
          <SkeletonCard height="100%" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, height: 210 }}>
          <SkeletonCard height="100%" />
          <SkeletonCard height="100%" />
          <SkeletonCard height="100%" />
        </div>
      </div>
    );
  }

  if (!stories.length) return null;

  // Ensure we always have something to render even with fewer than 5 stories
  const top    = stories.slice(0, 2);
  const bottom = stories.slice(2, 5);

  // Fill bottom row with duplicates if we have fewer than 5 total
  while (bottom.length < 3 && stories.length > 0) {
    bottom.push(stories[bottom.length % stories.length]);
  }

  return (
    <>
      {/* Inject hover animation style once */}
      <style>{`
        .tt-hero-card:hover .tt-hero-img { transform: scale(1.04); }
        .tt-hero-card { text-decoration: none; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Fila 1: 2 noticias grandes ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          height: 360,
        }}>
          {top.map(story => (
            <LargeCard key={story.id} story={story} />
          ))}
          {/* Fill empty slot if only 1 story */}
          {top.length < 2 && (
            <div style={{ borderRadius: 'var(--tt-r-lg)', background: 'var(--tt-paper-2)' }} />
          )}
        </div>

        {/* ── Fila 2: 3 noticias pequeñas ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          height: 210,
        }}>
          {bottom.map((story, idx) => (
            <SmallCard key={`${story.id}-${idx}`} story={story} />
          ))}
        </div>

      </div>
    </>
  );
};

export default HeroMosaic;
