import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import UtilityStrip from '../components/UtilityStrip.jsx';
import Header from '../components/Header.jsx';
import HeaderMobile from '../components/HeaderMobile.jsx';
import TTLogo from '../components/TTLogo.jsx';
import StoryCard from '../components/StoryCard.jsx';
import MostReadBox from '../components/MostReadBox.jsx';
import Footer from '../components/Footer.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Icon from '../components/Icon.jsx';
import { fetchPost, fetchOtherPosts, fetchPosts, registerView, fetchBanners, fetchRelatedPreview, MOCK_DATA } from '../api/wordpress.js';
import BannerSlot from '../components/BannerSlot.jsx';
import CommentsSection from '../components/CommentsSection.jsx';

const TTImage = ({ tone, aspect = '16x9', style = {} }) => (
  <div className={`tt-img tt-img--${tone || 'recientes'} tt-aspect-${aspect}`} style={{ width: '100%', ...style }} />
);

function fmtViews(n) {
  if (!n) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('es-VE');
}

function extractKeyPoints(html) {
  if (!html) return [];
  const clean = s => s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  const paras = html
    .split(/<\/?p[^>]*>/gi)
    .map(clean)
    .filter(s => s.length > 60);

  return paras
    .map(p => {
      // first sentence ending in . ! ?
      const m = p.match(/^.{40,200}?[.!?](?:\s|$)/);
      return m ? m[0].trim() : p.slice(0, 160) + (p.length > 160 ? '…' : '');
    })
    .slice(0, 2);
}

function buildShareUrls(title, url) {
  const enc = encodeURIComponent;
  return {
    whatsapp: `https://wa.me/?text=${enc(title + ' ' + url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    twitter:  `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
    email:    `mailto:?subject=${enc(title)}&body=${enc(url)}`,
  };
}

function copyLink(url, onCopied) {
  navigator.clipboard.writeText(url).then(onCopied).catch(() => {});
}

function makeRelatedBlock(slug, text) {
  const clean = text.replace(/<[^>]+>/g, '').trim();
  if (!clean) return null;
  return `<div class="tt-related-block" data-slug="${slug}">
    <span class="tt-related-label">Noticia relacionada</span>
    <span class="tt-related-title">${clean}</span>
    <span class="tt-related-arrow" aria-hidden="true">→</span>
  </div>`;
}

function injectRelatedBlocks(html) {
  if (!html) return html;
  // WordPress embedded posts: <blockquote class="wp-embedded-content"><a href="...">title</a></blockquote>
  let out = html.replace(
    /<blockquote[^>]*class="[^"]*wp-embedded-content[^"]*"[^>]*>\s*<a\s+href="https?:\/\/(?:www\.)?tanetanae\.com\/([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/blockquote>/gi,
    (_m, slug, text) => makeRelatedBlock(slug, text) || _m
  );
  // Plain paragraph links to tanetanae.com
  out = out.replace(
    /<p[^>]*>\s*<a\s+href="https?:\/\/(?:www\.)?tanetanae\.com\/([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/p>/gi,
    (_m, slug, text) => makeRelatedBlock(slug, text) || _m
  );
  return out;
}

export default function ArticlePage({ theme, setTheme }) {
  const { slug }   = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Seed with router state so title/image appear instantly while API loads
  const [article, setArticle] = useState(location.state?.preview || null);
  const [notFound, setNotFound] = useState(false);
  const [mostRead, setMostRead] = useState(MOCK_DATA.mostRead);
  const [related, setRelated] = useState(MOCK_DATA.related);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [banners, setBanners] = useState({});
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

    fetchBanners().then(setBanners);

    Promise.allSettled([
      fetchPost(slug),
      fetchOtherPosts(),
      fetchPosts({ perPage: 3 }),
    ]).then(([articleResult, mostReadResult, relatedResult]) => {
      if (cancelled) return;
      const art = articleResult.status === 'fulfilled' ? articleResult.value : MOCK_DATA.article;
      if (art === null) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArticle(art || MOCK_DATA.article);
      if (mostReadResult.status === 'fulfilled') setMostRead(mostReadResult.value);
      if (relatedResult.status === 'fulfilled') setRelated(relatedResult.value.posts);
      setLoading(false);
      // Una vista por sesión por artículo (sessionStorage se borra al cerrar el tab)
      const sessionKey = `tt_viewed_${art.id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        registerView(art.id).then(views => {
          if (views != null) setArticle(prev => prev ? { ...prev, views } : prev);
        });
      }
    });

    return () => { cancelled = true; };
  }, [slug]);

  const a          = article || MOCK_DATA.article;
  const siteUrl    = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
  const articleUrl = a.slug ? `${siteUrl}/${a.slug}` : window.location.href;
  const onCopied   = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareUrls  = buildShareUrls(a.title, articleUrl);

  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const articleAge = a.publishedAt ? Date.now() - new Date(a.publishedAt).getTime() : Infinity;
  const commentsEnabled = a.commentStatus === 'open' && articleAge < THREE_DAYS_MS;

  const printOnly = (
    <div className="tt-print-only">
      <div className="tt-print-masthead">
        <strong>TANE TANAE</strong><span>tanetanae.com</span>
      </div>
      {a.cat && <p className="tt-print-cat">{a.cat}</p>}
      <h1 className="tt-print-title">{a.title}</h1>
      {a.deck && <p className="tt-print-deck">{a.deck}</p>}
      <p className="tt-print-byline">{a.author} · {a.date}</p>
      <hr className="tt-print-hr" />
      {a.content
        ? <div className="tt-print-body" dangerouslySetInnerHTML={{ __html: a.content }} />
        : (a.body || []).map((b, i) => {
            if (b.type === 'p') return <p key={i}>{b.text}</p>;
            if (b.type === 'h') return <h2 key={i}>{b.text}</h2>;
            if (b.type === 'quote') return (
              <blockquote key={i}>
                <p>{b.text}</p>
                {b.who && <cite>— {b.who}</cite>}
              </blockquote>
            );
            return null;
          })
      }
      {(a.tags || []).length > 0 && (
        <p className="tt-print-tags">Etiquetas: {a.tags.join(', ')}</p>
      )}
      <p className="tt-print-url">{articleUrl}</p>
    </div>
  );

  // Actualiza OG + Twitter Card tags para compartir en redes
  useEffect(() => {
    if (!a.slug) return;
    const setProp = (prop, content) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const setName = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const desc = a.deck || a.excerpt || '';
    document.title = `${a.title} · Tane Tanae`;
    // Open Graph (Facebook, WhatsApp, LinkedIn…)
    setProp('og:title',       a.title);
    setProp('og:description', desc);
    setProp('og:url',         articleUrl);
    setProp('og:type',        'article');
    if (a.imgUrl) setProp('og:image', a.imgUrl);
    // Twitter Card
    setName('twitter:card',        a.imgUrl ? 'summary_large_image' : 'summary');
    setName('twitter:title',       a.title);
    setName('twitter:description', desc);
    if (a.imgUrl) setName('twitter:image', a.imgUrl);
    return () => { document.title = 'Tane Tanae · Así pasó'; };
  }, [a.slug, articleUrl]);

  // Enrich related blocks with image + excerpt after content renders
  useEffect(() => {
    if (!a.content) return;
    const timer = setTimeout(() => {
      const blocks = document.querySelectorAll('.tt-article-body .tt-related-block[data-slug]:not([data-enriched])');
      blocks.forEach(async block => {
        const slug = block.dataset.slug;
        block.dataset.enriched = '1';
        const preview = await fetchRelatedPreview(slug);
        if (!preview) return;
        const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const excFull = preview.excerpt || '';
        const exc = excFull.length > 80 ? excFull.slice(0, 80) + '…' : excFull;
        const imgHtml = preview.imgUrl
          ? `<img class="tt-related-img" src="${preview.imgUrl}" alt="" loading="lazy" />`
          : '';
        block.innerHTML = `
          <span class="tt-related-label">Noticia relacionada</span>
          ${imgHtml}
          <div class="tt-related-text">
            <span class="tt-related-title">${esc(preview.title)}</span>
            ${exc ? `<span class="tt-related-excerpt">${esc(exc)}</span>` : ''}
          </div>
          <span class="tt-related-arrow" aria-hidden="true">→</span>
        `;
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [a.content]);

  if (notFound) {
    return (
      <div style={{ background: 'var(--tt-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isMobile
          ? <HeaderMobile theme={theme} setTheme={setTheme} />
          : <><UtilityStrip /><Header theme={theme} setTheme={setTheme} /></>
        }
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
          <TTLogo size={28} />
          <div style={{ marginTop: 40, marginBottom: 16, fontFamily: 'var(--tt-font-display)', fontSize: isMobile ? 80 : 120, lineHeight: 1, color: 'var(--tt-line-strong)', fontWeight: 400 }}>
            404
          </div>
          <h1 className="tt-headline" style={{ fontSize: isMobile ? 24 : 32, marginBottom: 12 }}>
            Esta nota no existe
          </h1>
          <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 15, color: 'var(--tt-ink-muted)', maxWidth: 360, lineHeight: 1.5, marginBottom: 36 }}>
            El artículo que buscas fue eliminado, movido o nunca existió en este sitio.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--tt-ink)', color: 'white',
              padding: '12px 24px', borderRadius: 'var(--tt-r-pill)',
              fontFamily: 'var(--tt-font-sans)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}>
              Ir al inicio
            </Link>
            <button onClick={() => window.history.back()} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'var(--tt-ink)',
              padding: '12px 24px', borderRadius: 'var(--tt-r-pill)',
              border: '1px solid var(--tt-line-strong)',
              fontFamily: 'var(--tt-font-sans)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
            }}>
              Volver atrás
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--tt-paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <style>{`
          @keyframes tt-logo-float {
            0%, 100% { transform: translateY(0px); opacity: 1; }
            50%       { transform: translateY(-10px); opacity: 0.65; }
          }
          @keyframes tt-logo-bar {
            0%   { transform: scaleX(0); }
            50%  { transform: scaleX(0.7); }
            100% { transform: scaleX(0); }
          }
        `}</style>
        <div style={{ animation: 'tt-logo-float 1.8s ease-in-out infinite' }}>
          <TTLogo size={32} />
        </div>
        <div style={{ width: 48, height: 2, background: 'var(--tt-line-strong)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--tt-green-vivid)', borderRadius: 999, transformOrigin: 'left', animation: 'tt-logo-bar 1.8s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  // ── Desktop article ──────────────────────────────────────
  if (!isMobile) {
    return (<>
      <div className="tt" ref={wrapRef} style={{ background: 'var(--tt-paper)', position: 'relative' }}>
        {/* Reading progress */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, height: 3, width: '100%', background: 'rgba(0,0,0,0.08)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--tt-green-vivid)', transition: 'width 0.15s ease' }} />
        </div>

        <UtilityStrip />
        <Header compact theme={theme} setTheme={setTheme} />

        {/* Cinematic hero */}
        <section style={{ position: 'relative', height: 'min(624px, 94vh)', background: 'var(--tt-ink)', color: 'white', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            {a.imgFull || a.imgUrl
              ? <img src={a.imgFull || a.imgUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
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
              {a.kicker && a.kicker !== a.cat && <span className="tt-chip tt-chip--ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.85)' }}>{a.kicker}</span>}
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
                <span>{a.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Lectura</span>
                <span>{a.readTime}</span>
              </div>
              {fmtViews(a.views) && (
                <>
                  <span style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Visitas</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="eye" size={13} /> {fmtViews(a.views)}
                    </span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { n: 'whatsapp', href: shareUrls.whatsapp },
                  { n: 'facebook', href: shareUrls.facebook },
                  { n: 'twitter',  href: shareUrls.twitter  },
                  { n: 'email',    href: shareUrls.email    },
                ].map(({ n, href }) => {
                  const s = {
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                    color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none',
                  };
                  return (
                    <a key={n} href={href} target="_blank" rel="noopener noreferrer" style={s}>
                      <Icon name={n} size={13} />
                    </a>
                  );
                })}
                <button onClick={() => window.print()} title="Imprimir" style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                  color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                }}>
                  <Icon name="print" size={13} />
                </button>
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
            {[
              { n: 'whatsapp', c: '#25D366', href: shareUrls.whatsapp },
              { n: 'facebook', c: '#1877F2', href: shareUrls.facebook },
              { n: 'twitter',  c: '#1a1a1a', href: shareUrls.twitter  },
              { n: 'email',    c: '#555',    href: shareUrls.email    },
            ].map(({ n, c, href }) => (
              <a key={n} href={href} target="_blank" rel="noopener noreferrer" style={{
                width: 44, height: 44, borderRadius: '50%', background: c,
                color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--tt-shadow-card)', textDecoration: 'none',
              }}><Icon name={n} size={16} /></a>
            ))}
            <button onClick={() => window.print()} title="Imprimir" style={{
              width: 44, height: 44, borderRadius: '50%', background: 'var(--tt-paper-2)',
              color: 'var(--tt-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--tt-shadow-card)', border: 'none', cursor: 'pointer',
            }}><Icon name="print" size={16} /></button>
            <button
              onClick={() => copyLink(articleUrl, onCopied)}
              title={copied ? '¡Copiado!' : 'Copiar enlace'}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: copied ? 'var(--tt-green)' : 'var(--tt-paper-2)',
                color: copied ? 'white' : 'var(--tt-ink)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--tt-shadow-card)', border: 'none', cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            ><Icon name="link" size={16} /></button>
          </div>

          {/* Main content */}
          <article style={{ maxWidth: 680 }}>
            {/* Key points */}
            {a.catSlug !== 'videos' && <aside style={{ background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)', borderRadius: 'var(--tt-r-lg)', padding: '24px 28px', marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--tt-green)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>★</span>
                <span className="tt-eyebrow">Lo esencial · {a.readTime} de lectura</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(a.content ? extractKeyPoints(a.content) : (a.body || []).filter(b => b.type === 'p').map(b => b.text.slice(0, 160))).map((point, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.45 }}>
                    <span style={{ flexShrink: 0, fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', color: 'var(--tt-green)', fontSize: 16, lineHeight: 1.2, minWidth: 16 }}>0{i + 1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </aside>}

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
                className="tt-article-body"
                style={{ fontFamily: 'var(--tt-font-serif)', fontSize: 19, lineHeight: 1.55, color: 'var(--tt-ink)' }}
                onClick={e => {
                  const block = e.target.closest('.tt-related-block');
                  if (block) { e.preventDefault(); navigate(`/${block.dataset.slug}`); }
                }}
                dangerouslySetInnerHTML={{ __html: injectRelatedBlocks(a.content) }}
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

            {/* Banner después del cuerpo */}
            <BannerSlot banner={banners['articulo-cuerpo']} style={{ marginTop: 40 }} />

            <CommentsSection postId={a.id} enabled={commentsEnabled} />
          </article>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'sticky', top: 80, alignSelf: 'start' }}>
            <MostReadBox stories={mostRead.slice(0, 4)} />
            <BannerSlot banner={banners['articulo-sidebar']} />
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

      </div>
      {printOnly}
    </>);
  }

  // ── Mobile article ───────────────────────────────────────
  return (<>
    <div className="tt" ref={wrapRef} style={{ background: 'var(--tt-paper)', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, height: 3, background: 'rgba(0,0,0,0.08)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--tt-green-vivid)' }} />
      </div>
      <HeaderMobile activeCategory={a.catSlug} theme={theme} setTheme={setTheme} />

      {/* Hero */}
      <section style={{ position: 'relative', background: 'var(--tt-ink)', color: 'white', overflow: 'hidden' }}>
        {/* Image — fixed 260px, not flexible */}
        <div style={{ position: 'relative', height: 260, flexShrink: 0 }}>
          {a.imgFull || a.imgUrl
            ? <img src={a.imgFull || a.imgUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <TTImage tone={a.img} style={{ height: '100%' }} aspect="" />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }} />
          {/* Breadcrumb */}
          <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Inicio · </Link>
              <span style={{ color: 'var(--tt-green-vivid)' }}>{a.cat}</span>
            </span>
          </div>
        </div>

        {/* Title + meta — below the image, dark bg */}
        <div style={{ padding: '20px 20px 24px', background: '#0E1116' }}>
          <span className="tt-chip" style={{ background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)', marginBottom: 14, display: 'inline-block' }}>{a.cat}</span>
          <h1 className="tt-headline" style={{ color: 'white', fontSize: 30, lineHeight: 1.05, marginBottom: 20 }}>{a.title}</h1>

          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)',
              fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{(a.author || 'T').charAt(0)}</span>
            <div>
              <div style={{ fontWeight: 500, color: 'white', fontSize: 14 }}>{a.author}</div>
              {a.authorRole && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{a.authorRole}</div>}
            </div>
          </div>

          {/* Date / Lectura / Visitas */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Publicado</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{a.date}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Lectura</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{a.readTime}</span>
            </div>
            {fmtViews(a.views) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Visitas</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="eye" size={12} /> {fmtViews(a.views)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Share row */}
      <div style={{ background: 'var(--tt-paper)', padding: '10px 16px', borderBottom: '1px solid var(--tt-line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ flex: 1, fontFamily: 'var(--tt-font-sans)', fontSize: 11, color: 'var(--tt-ink-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Compartir</span>
        {[
          { n: 'whatsapp', c: '#25D366', href: shareUrls.whatsapp },
          { n: 'facebook', c: '#1877F2', href: shareUrls.facebook },
          { n: 'twitter',  c: '#1a1a1a', href: shareUrls.twitter  },
          { n: 'email',    c: '#555',    href: shareUrls.email    },
        ].map(({ n, c, href }) => (
          <a key={n} href={href} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: '50%', background: c, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <Icon name={n} size={15} />
          </a>
        ))}
        <button onClick={() => copyLink(articleUrl, onCopied)} title={copied ? '¡Copiado!' : 'Copiar enlace'} style={{ width: 36, height: 36, borderRadius: '50%', background: copied ? 'var(--tt-green)' : 'var(--tt-paper-2)', color: copied ? 'white' : 'var(--tt-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}>
          <Icon name="link" size={15} />
        </button>
      </div>

      {/* Key points */}
      {a.catSlug !== 'videos' && (
        <aside style={{ margin: 16, background: 'var(--tt-green-soft)', border: '1px solid var(--tt-green-line)', borderRadius: 'var(--tt-r-lg)', padding: 18 }}>
          <div className="tt-eyebrow" style={{ marginBottom: 12 }}>Lo esencial · {a.readTime}</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(a.content ? extractKeyPoints(a.content) : (a.body || []).filter(b => b.type === 'p').map(b => b.text.slice(0, 160))).slice(0, 2).map((point, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.45 }}>
                <span style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', color: 'var(--tt-green)', fontSize: 14 }}>0{i + 1}</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

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
          <div
            className="tt-article-body"
            style={{ fontFamily: 'var(--tt-font-serif)', fontSize: 17, lineHeight: 1.55 }}
            onClick={e => {
              const block = e.target.closest('.tt-related-block');
              if (block) { e.preventDefault(); navigate(`/${block.dataset.slug}`); }
            }}
            dangerouslySetInnerHTML={{ __html: injectRelatedBlocks(a.content) }}
          />
        )}
      </article>

      {/* Comments — mobile */}
      <div style={{ padding: '0 20px' }}>
        <CommentsSection postId={a.id} enabled={commentsEnabled} />
      </div>

      {/* Related */}
      <section style={{ padding: '32px 16px 100px' }}>
        <SectionHead num="↳" title="Continúa" italic="leyendo" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {related.slice(0, 3).map(s => (
            <Link key={s.id} to={s.slug ? `/${s.slug}` : '/'} style={{
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
        <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer" style={{ flex: 1, height: 42, borderRadius: 'var(--tt-r-pill)', background: '#25D366', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
          <Icon name="whatsapp" size={16} /> WhatsApp
        </a>
        <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" style={{ width: 42, height: 42, borderRadius: '50%', background: '#1877F2', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <Icon name="facebook" size={16} />
        </a>
        <a href={shareUrls.email} style={{ width: 42, height: 42, borderRadius: '50%', background: '#555', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <Icon name="email" size={16} />
        </a>
        <button onClick={() => window.print()} title="Imprimir" style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--tt-line-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
          <Icon name="print" size={16} />
        </button>
        <button onClick={() => copyLink(articleUrl, onCopied)} title={copied ? '¡Copiado!' : 'Copiar enlace'} style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--tt-line-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copied ? 'var(--tt-green)' : 'transparent', color: copied ? 'white' : 'inherit', transition: 'background 0.2s, color 0.2s', cursor: 'pointer' }}>
          <Icon name="link" size={16} />
        </button>
      </div>
    </div>
    {printOnly}
  </>);
}
