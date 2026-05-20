import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

const TTImage = ({ tone, style = {}, aspect = '16x9' }) => (
  <div
    className={`tt-img tt-img--${tone || 'recientes'} ${aspect ? `tt-aspect-${aspect}` : ''}`}
    style={{ width: '100%', ...style }}
  />
);

const HeroCard = ({ story }) => (
  <article style={{
    position: 'relative',
    borderRadius: 'var(--tt-r-lg)',
    overflow: 'hidden',
    background: 'var(--tt-ink)',
    color: 'white',
    height: '100%',
    minHeight: 480,
  }}>
    <div style={{ position: 'absolute', inset: 0 }}>
      {story.imgUrl ? (
        <img src={story.imgUrl} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <TTImage tone={story.img} style={{ height: '100%' }} aspect="" />
      )}
    </div>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.9) 100%)',
    }} />
    <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '32px 40px' }}>
      <div style={{ display: 'inline-flex', gap: 8, marginBottom: 16 }}>
        <span className="tt-chip">{story.cat}</span>
        {story.kicker && (
          <span className="tt-chip tt-chip--ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.85)' }}>
            {story.kicker}
          </span>
        )}
      </div>
      <h2 className="tt-headline" style={{ fontSize: 52, color: 'white', maxWidth: '16ch', marginBottom: 14 }}>
        {story.title}
      </h2>
      {story.excerpt && (
        <p style={{
          fontFamily: 'var(--tt-font-sans)', fontSize: 15, lineHeight: 1.5,
          maxWidth: '60ch', color: 'rgba(255,255,255,0.78)', marginBottom: 22,
        }}>{story.excerpt}</p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
        <span style={{ fontWeight: 500 }}>Por {story.author}</span>
        <span style={{ width: 3, height: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 999 }} />
        <span>{story.date}</span>
        <span style={{ width: 3, height: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 999 }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="clock" size={12} /> {story.readTime}
        </span>
      </div>
    </div>
  </article>
);

const HeroSlider = ({ stories = [] }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (stories.length <= 1) return;
    const id = setInterval(() => setI(v => (v + 1) % stories.length), 7000);
    return () => clearInterval(id);
  }, [stories.length]);

  if (!stories.length) return null;
  const main = stories[i];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24 }}>
      <div style={{ position: 'relative', height: 560 }}>
        <Link to={`/articulo/${main.slug || main.id}`} style={{ display: 'block', height: '100%' }}>
          <HeroCard story={main} />
        </Link>
        {/* Slide dots */}
        <div style={{
          position: 'absolute', bottom: 22, right: 28,
          display: 'flex', gap: 6, padding: '8px 10px',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--tt-r-pill)',
        }}>
          {stories.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} style={{
              width: idx === i ? 24 : 6, height: 6, borderRadius: 999,
              background: idx === i ? 'var(--tt-green-vivid)' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.25s',
            }} />
          ))}
        </div>
        {/* Arrows */}
        <button
          onClick={() => setI(v => (v - 1 + stories.length) % stories.length)}
          style={{
            position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="chevron_l" size={20} />
        </button>
        <button
          onClick={() => setI(v => (v + 1) % stories.length)}
          style={{
            position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="chevron_r" size={20} />
        </button>
      </div>

      {/* Thumbnail rail */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 0,
        border: '1px solid var(--tt-line)',
        borderRadius: 'var(--tt-r-lg)',
        background: 'var(--tt-white)',
        padding: 18,
        height: 560,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="tt-eyebrow" style={{ color: 'var(--tt-ink-muted)' }}>Portada</span>
          <span className="tt-meta" style={{ fontSize: 11 }}>
            {String(i + 1).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {stories.map((s, idx) => (
            <button key={s.id} onClick={() => setI(idx)} style={{
              display: 'grid',
              gridTemplateColumns: '76px 1fr',
              gap: 12,
              padding: 10,
              borderRadius: 'var(--tt-r-md)',
              background: idx === i ? 'var(--tt-green-soft)' : 'transparent',
              border: idx === i ? '1px solid var(--tt-green-line)' : '1px solid transparent',
              textAlign: 'left',
              transition: 'background 0.2s',
              flex: 1,
              cursor: 'pointer',
            }}>
              <div style={{ borderRadius: 6, overflow: 'hidden' }}>
                {s.imgUrl ? (
                  <img src={s.imgUrl} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                ) : (
                  <TTImage tone={s.img} aspect="1x1" />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--tt-green)',
                }}>{s.cat}</span>
                <h4 className="tt-headline" style={{ fontSize: 15, lineHeight: 1.15 }}>{s.title}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
