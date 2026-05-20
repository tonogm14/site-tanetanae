import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import UtilityStrip from '../components/UtilityStrip.jsx';
import Header from '../components/Header.jsx';
import HeaderMobile from '../components/HeaderMobile.jsx';
import StoryCard from '../components/StoryCard.jsx';
import MostReadBox from '../components/MostReadBox.jsx';
import Ad from '../components/Ad.jsx';
import Footer from '../components/Footer.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Icon from '../components/Icon.jsx';
import { fetchPost, fetchMostRead, fetchPosts, MOCK_DATA } from '../api/wordpress.js';

const TTImage = ({ tone, aspect = '16x9', style = {} }) => (
  <div className={`tt-img tt-img--${tone || 'recientes'} tt-aspect-${aspect}`} style={{ width: '100%', ...style }} />
);

export default function ArticlePage({ theme, setTheme }) {
  const { slug } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [article, setArticle] = useState(null);
  const [mostRead, setMostRead] = useState(MOCK_DATA.mostRead);
  const [related, setRelated] = useState(MOCK_DATA.related);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const seen = -rect.top;
      setProgress(Math.max(0, Math.min(100, Math.round((seen / total) * 100))));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    window.scrollTo(0, 0);

    Promise.allSettled([
      fetchPost(slug),
      fetchMostRead(),
      fetchPosts({ perPage: 3 }),
    ]).then(([articleResult, mostReadResult, relatedResult]) => {
      if (cancelled) return;
      setArticle(articleResult.status === 'fulfilled' ? (articleResult.value || MOCK_DATA.article) : MOCK_DATA.article);
      if (mostReadResult.status === 'fulfilled') setMostRead(mostReadResult.value);
      if (relatedResult.status === 'fulfilled') setRelated(relatedResult.value.posts);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [slug]);

  const a = article || MOCK_DATA.article;

  if (loading) {
    return (
      <div style={{ background: 'var(--tt-paper)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--tt-ink-muted)' }}>
          Cargando…
        </div>
      </div>
    );
  }

  // ── Desktop article ──────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="tt" ref={wrapRef} style={{ background: 'var(--tt-paper)', position: 'relative' }}>
        {/* Reading progress */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, height: 3, width: '100%', background: 'rgba(0,0,0,0.08)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--tt-green-vivid)', transition: 'width 0.15s ease' }} />
        </div>

        <UtilityStrip />
        <Header compact theme={theme} setTheme={setTheme} />

        {/* Cinematic hero */}
        <section style={{ position: 'relative', height: 720, background: 'var(--tt-ink)', color: 'white', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            {a.imgFull || a.imgUrl
              ? <img src={a.imgFull || a.imgUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <TTImage tone={a.img} style={{ height: '100%' }} aspect="" />
            }
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.85) 100%)' }} />

          {/* Breadcrumbs */}
          <div style={{ position: 'absolute', top: 28, left: 40, right: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Inicio</Link>
              <Icon name="chevron_r" size={11} />
              {a.catSlug && <Link to={`/categoria/${a.catSlug}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{a.cat}</Link>}
              <Icon name="chevron_r" size={11} />
              <span style={{ color: 'var(--tt-green-vivid)' }}>Análisis</span>
            </div>
            <span style={{
              fontFamily: 'var(--tt-font-sans)', fontSize: 11, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
              padding: '6px 12px', borderRadius: 'var(--tt-r-pill)', border: '1px solid rgba(255,255,255,0.18)',
            }}>
              <span style={{ color: 'var(--tt-green-vivid)' }}>●</span> Reportaje
            </span>
          </div>

          {/* Title block */}
          <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '0 40px 56px', maxWidth: 1240, margin: '0 auto', left: 0, right: 0 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
              <span className="tt-chip" style={{ background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)' }}>{a.cat}</span>
              {a.kicker && <span className="tt-chip tt-chip--ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.85)' }}>{a.kicker}</span>}
            </div>
            <h1 className="tt-headline" style={{ color: 'white', fontSize: 72, maxWidth: '20ch', lineHeight: 0.95, marginBottom: 32 }}>
              {a.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)',
                  fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 22,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{(a.author || 'T').charAt(0)}</span>
                <div>
                  <div style={{ fontWeight: 500, color: 'white' }}>{a.author}</div>
                  {a.authorRole && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{a.authorRole}</div>}
                </div>
              </div>
              <span style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Publicado</span>
                <span>{a.date}{a.time ? `, ${a.time}` : ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Lectura</span>
                <span>{a.readTime}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['whatsapp', 'facebook', 'twitter'].map(n => (
                  <button key={n} style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                    color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name={n} size={13} /></button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Body — 3 col */}
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px', display: 'grid', gridTemplateColumns: '72px minmax(0,1fr) 280px', gap: 48 }}>
          {/* Share rail */}
          <div style={{ position: 'sticky', top: 80, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tt-ink-faint)' }}>
              Compartir esta nota
            </span>
            <span style={{ width: 1, height: 28, background: 'var(--tt-line-strong)' }} />
            {[{ n: 'whatsapp', c: 'var(--tt-green)' }, { n: 'facebook', c: 'var(--tt-ink)' }, { n: 'twitter', c: 'var(--tt-ink)' }, { n: 'share', c: 'var(--tt-ink)' }, { n: 'bookmark', c: 'var(--tt-ink)' }].map(({ n, c }) => (
              <button key={n} style={{
                width: 44, height: 44, borderRadius: '50%', background: c,
                color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--tt-shadow-card)',
              }}><Icon name={n} size={16} /></button>
            ))}
          </div>

          {/* Main content */}
          <article style={{ maxWidth: 680 }}>
            {/* Key points */}
            <aside style={{ background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)', borderRadius: 'var(--tt-r-lg)', padding: '24px 28px', marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--tt-green)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>★</span>
                <span className="tt-eyebrow">Lo esencial · {a.readTime} de lectura</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(a.body || []).filter(b => b.type === 'p').slice(0, 4).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.45 }}>
                    <span style={{ flexShrink: 0, fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', color: 'var(--tt-green)', fontSize: 16, lineHeight: 1.2, minWidth: 16 }}>0{i + 1}</span>
                    <span>{b.text.slice(0, 120)}{b.text.length > 120 ? '…' : ''}</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Body */}
            {(a.body || []).map((b, i) => {
              if (b.type === 'p') return (
                <p key={i} style={{ fontFamily: 'var(--tt-font-serif)', fontSize: b.lead ? 21 : 19, lineHeight: 1.55, color: 'var(--tt-ink)', marginBottom: 24, fontWeight: b.lead ? 500 : 400, letterSpacing: '-0.005em' }}>
                  {i === 0 && (
                    <span style={{ float: 'left', fontFamily: 'var(--tt-font-display)', fontSize: 90, lineHeight: 0.78, paddingRight: 14, paddingTop: 6, color: 'var(--tt-green)' }}>
                      {b.text.charAt(0)}
                    </span>
                  )}
                  {i === 0 ? b.text.slice(1) : b.text}
                </p>
              );
              if (b.type === 'h') return (
                <h2 key={i} className="tt-headline" style={{ fontFamily: 'var(--tt-font-display)', fontSize: 34, marginTop: 36, marginBottom: 18, fontWeight: 400 }}>{b.text}</h2>
              );
              if (b.type === 'quote') return (
                <blockquote key={i} style={{ margin: '36px -32px', padding: '32px 40px', borderLeft: '4px solid var(--tt-green-vivid)', background: 'var(--tt-paper-2)', borderRadius: '0 var(--tt-r-md) var(--tt-r-md) 0' }}>
                  <span style={{ fontFamily: 'var(--tt-font-display)', fontSize: 80, lineHeight: 0.4, color: 'var(--tt-green)', display: 'block', marginBottom: 8 }}>"</span>
                  <p style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 30, lineHeight: 1.25, color: 'var(--tt-ink)', letterSpacing: '-0.01em', marginBottom: 14 }}>{b.text}</p>
                  {b.who && <cite style={{ fontFamily: 'var(--tt-font-sans)', fontStyle: 'normal', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-ink-muted)' }}>— {b.who}</cite>}
                </blockquote>
              );
              return null;
            })}

            {/* If content is HTML, render it */}
            {!a.body?.length && a.content && (
              <div
                style={{ fontFamily: 'var(--tt-font-serif)', fontSize: 19, lineHeight: 1.55, color: 'var(--tt-ink)' }}
                dangerouslySetInnerHTML={{ __html: a.content }}
              />
            )}

            {/* Tags */}
            {(() => {
              const uniqueTags = [...new Set(a.tags || [])];
              const displayTags = a.cat && !uniqueTags.includes(a.cat) ? [a.cat, ...uniqueTags] : uniqueTags;
              return displayTags.length > 0 ? (
                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--tt-line)' }}>
                  <span className="tt-eyebrow" style={{ color: 'var(--tt-ink-muted)', marginBottom: 14, display: 'block' }}>Etiquetas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {displayTags.map(t => (
                      <a key={t} href="#" style={{ padding: '6px 12px', borderRadius: 'var(--tt-r-pill)', background: 'var(--tt-paper-2)', fontSize: 12, fontWeight: 500, color: 'var(--tt-ink-muted)' }}>#{t}</a>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Author bio */}
            <div style={{ marginTop: 40, padding: '24px 24px 22px', background: 'var(--tt-ink)', color: 'white', borderRadius: 'var(--tt-r-lg)', display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 20, alignItems: 'center' }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)', fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {(a.author || 'T').charAt(0)}
              </span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--tt-green-vivid)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Sobre el autor</div>
                <div style={{ fontFamily: 'var(--tt-font-display)', fontSize: 24, fontStyle: 'italic' }}>{a.author}</div>
                {a.authorRole && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{a.authorRole}</div>}
              </div>
              <button className="tt-btn" style={{ background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)' }}>
                Ver más notas <Icon name="arrow" size={12} />
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'sticky', top: 80, alignSelf: 'start' }}>
            <MostReadBox stories={mostRead.slice(0, 4)} />
            <Ad size="rectangle" />
          </aside>
        </section>

        <div className="tt-wave" style={{ maxWidth: 1240, margin: '0 auto' }} />

        {/* Related */}
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 40px 80px' }}>
          <SectionHead num="↳" title="Continúa" italic="leyendo" />
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 28 }}>
            {related.slice(0, 3).map((s, i) => (
              <StoryCard key={s.id} story={s} size={i === 0 ? 'lg' : 'md'} />
            ))}
          </div>
        </section>

        <Footer />

        {/* Floating WhatsApp */}
        <button style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 40,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--tt-green)', color: 'white',
          boxShadow: '0 8px 24px rgba(14,122,63,0.4)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="whatsapp" size={26} />
        </button>
      </div>
    );
  }

  // ── Mobile article ───────────────────────────────────────
  return (
    <div className="tt" ref={wrapRef} style={{ background: 'var(--tt-paper)', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, height: 3, background: 'rgba(0,0,0,0.08)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--tt-green-vivid)' }} />
      </div>
      <HeaderMobile activeCategory={a.catSlug} theme={theme} setTheme={setTheme} />

      {/* Hero */}
      <section style={{ position: 'relative', height: 480, background: 'var(--tt-ink)', color: 'white', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {a.imgFull || a.imgUrl
            ? <img src={a.imgFull || a.imgUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <TTImage tone={a.img} style={{ height: '100%' }} aspect="" />
          }
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.9) 100%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Inicio · </Link>
            <span style={{ color: 'var(--tt-green-vivid)' }}>{a.cat}</span>
          </span>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bookmark" size={15} />
          </button>
        </div>
        <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: 20 }}>
          <span className="tt-chip" style={{ background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)', marginBottom: 14, display: 'inline-block' }}>{a.cat}</span>
          <h1 className="tt-headline" style={{ color: 'white', fontSize: 28, marginBottom: 14 }}>{a.title}</h1>
        </div>
      </section>

      {/* Meta row */}
      <div style={{ background: 'var(--tt-paper)', padding: '16px', borderBottom: '1px solid var(--tt-line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)', fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {(a.author || 'T').charAt(0)}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{a.author}</div>
          <div style={{ fontSize: 11, color: 'var(--tt-ink-faint)' }}>{a.date} · {a.readTime}</div>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tt-green)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="whatsapp" size={16} />
        </button>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tt-paper-2)', color: 'var(--tt-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="share" size={15} />
        </button>
      </div>

      {/* Key points */}
      <aside style={{ margin: 16, background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)', borderRadius: 'var(--tt-r-lg)', padding: 18 }}>
        <div className="tt-eyebrow" style={{ marginBottom: 12 }}>Lo esencial · {a.readTime}</div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(a.body || []).filter(b => b.type === 'p').slice(0, 3).map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.45 }}>
              <span style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', color: 'var(--tt-green)', fontSize: 14 }}>0{i + 1}</span>
              <span>{b.text.slice(0, 100)}{b.text.length > 100 ? '…' : ''}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Body */}
      <article style={{ padding: '12px 20px' }}>
        {(a.body || []).map((b, i) => {
          if (b.type === 'p') return (
            <p key={i} style={{ fontFamily: 'var(--tt-font-serif)', fontSize: b.lead ? 18 : 17, lineHeight: 1.55, marginBottom: 18, fontWeight: b.lead ? 500 : 400 }}>
              {i === 0 && (
                <span style={{ float: 'left', fontFamily: 'var(--tt-font-display)', fontSize: 70, lineHeight: 0.78, paddingRight: 10, paddingTop: 4, color: 'var(--tt-green)' }}>
                  {b.text.charAt(0)}
                </span>
              )}
              {i === 0 ? b.text.slice(1) : b.text}
            </p>
          );
          if (b.type === 'quote') return (
            <blockquote key={i} style={{ margin: '26px -20px', padding: '24px 22px', borderLeft: '4px solid var(--tt-green-vivid)', background: 'var(--tt-paper-2)' }}>
              <p style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.25, marginBottom: 10 }}>{b.text}</p>
              {b.who && <cite style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-ink-muted)', fontStyle: 'normal' }}>— {b.who}</cite>}
            </blockquote>
          );
          if (b.type === 'h') return <h2 key={i} className="tt-headline" style={{ fontSize: 24, marginTop: 22, marginBottom: 12 }}>{b.text}</h2>;
          return null;
        })}

        {!a.body?.length && a.content && (
          <div style={{ fontFamily: 'var(--tt-font-serif)', fontSize: 17, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: a.content }} />
        )}
      </article>

      {/* Related */}
      <section style={{ padding: '32px 16px 100px' }}>
        <SectionHead num="↳" title="Continúa" italic="leyendo" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {related.slice(0, 3).map(s => (
            <Link key={s.id} to={s.slug ? `/articulo/${s.slug}` : '/'} style={{
              display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12,
              paddingBlock: 14, borderBottom: '1px solid var(--tt-line)', textDecoration: 'none',
            }}>
              <div style={{ borderRadius: 6, overflow: 'hidden' }}>
                {s.imgUrl
                  ? <img src={s.imgUrl} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                  : <div className={`tt-img tt-img--${s.img || 'recientes'} tt-aspect-1x1`} style={{ width: '100%' }} />
                }
              </div>
              <div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-green)' }}>{s.cat}</span>
                <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.18, marginTop: 4 }}>{s.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />

      {/* Sticky bottom share bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: 'var(--tt-paper)', borderTop: '1px solid var(--tt-line)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', boxShadow: '0 -4px 20px rgba(14,17,22,0.06)' }}>
        <button style={{ flex: 1, height: 42, borderRadius: 'var(--tt-r-pill)', background: 'var(--tt-green)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          <Icon name="whatsapp" size={16} /> Compartir por WhatsApp
        </button>
        <button style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--tt-line-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="share" size={16} />
        </button>
        <button style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--tt-line-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bookmark" size={16} />
        </button>
      </div>
    </div>
  );
}
