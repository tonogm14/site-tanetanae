import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import UtilityStrip from '../components/UtilityStrip.jsx';
import BreakingBar from '../components/BreakingBar.jsx';
import Header from '../components/Header.jsx';
import HeaderMobile from '../components/HeaderMobile.jsx';
import StoryCard from '../components/StoryCard.jsx';
import MostReadBox from '../components/MostReadBox.jsx';
import BannerSlot from '../components/BannerSlot.jsx';
import Footer from '../components/Footer.jsx';
import { fetchPosts, fetchTag, fetchBreaking, fetchOtherPosts, fetchBanners, MOCK_DATA } from '../api/wordpress.js';

const WINDOW = 9;

const Pagination = ({ page, totalPages, onPage }) => {
  const windowStart = Math.floor((page - 1) / WINDOW) * WINDOW + 1;
  const windowEnd   = Math.min(windowStart + WINDOW - 1, totalPages);
  const pages = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  const btn = {
    width: 36, height: 36, borderRadius: 'var(--tt-r-md)',
    border: '1px solid var(--tt-line-strong)', background: 'transparent',
    fontFamily: 'var(--tt-font-sans)', fontSize: 14,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--tt-ink)', cursor: 'pointer',
  };
  return (
    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} style={{ ...btn, opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? 'default' : 'pointer' }}>‹</button>
      {windowStart > 1 && <button onClick={() => onPage(windowStart - 1)} style={{ ...btn, fontSize: 12 }}>···</button>}
      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)} style={{ ...btn, border: p === page ? 'none' : '1px solid var(--tt-line-strong)', background: p === page ? 'var(--tt-ink)' : 'transparent', color: p === page ? 'white' : 'var(--tt-ink)', fontWeight: p === page ? 700 : 400, cursor: p === page ? 'default' : 'pointer' }}>{p}</button>
      ))}
      {windowEnd < totalPages && <button onClick={() => onPage(windowEnd + 1)} style={{ ...btn, fontSize: 12 }}>···</button>}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} style={{ ...btn, opacity: page === totalPages ? 0.3 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}>›</button>
    </div>
  );
};

export default function TagPage({ theme, setTheme }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [tag, setTag]           = useState(null);
  const [posts, setPosts]       = useState([]);
  const [mostRead, setMostRead] = useState(MOCK_DATA.mostRead);
  const [breaking, setBreaking] = useState(MOCK_DATA.breaking);
  const [loading, setLoading]   = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [banners, setBanners]   = useState({});
  const prevSlug = useRef(slug);

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page    = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (prevSlug.current === slug) return;
    prevSlug.current = slug;
    setPosts([]);
    setTag(null);
    setSearchParams({}, { replace: true });
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBanners().then(setBanners);

    Promise.allSettled([
      fetchTag(slug),
      fetchPosts({ page, perPage: 12, tag: slug }),
      fetchBreaking(),
      fetchOtherPosts(),
    ]).then(([tagRes, postsRes, breakingRes, mostReadRes]) => {
      if (cancelled) return;
      if (tagRes.status === 'fulfilled' && tagRes.value) setTag(tagRes.value);
      if (postsRes.status === 'fulfilled') {
        setPosts(postsRes.value.posts);
        setTotalPages(postsRes.value.totalPages);
      } else {
        setPosts([]);
      }
      if (breakingRes.status === 'fulfilled') setBreaking(breakingRes.value);
      if (mostReadRes.status === 'fulfilled') setMostRead(mostReadRes.value);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [slug, page]);

  useEffect(() => {
    const name = tag?.name || slug;
    document.title = `#${name} · Tane Tanae`;
  }, [tag, slug]);

  const displayName = tag?.name || slug;

  return (
    <div style={{ background: 'var(--tt-paper)', position: 'relative' }}>
      {isMobile ? (
        <>
          <BreakingBar items={breaking} />
          <HeaderMobile theme={theme} setTheme={setTheme} />
        </>
      ) : (
        <>
          <UtilityStrip />
          <BreakingBar items={breaking} />
          <Header theme={theme} setTheme={setTheme} />
        </>
      )}

      {/* Header del tag */}
      <div style={{ background: '#0E1116', color: 'white', padding: isMobile ? '32px 16px' : '56px 40px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tt-green-vivid)', display: 'block', marginBottom: 8 }}>Etiqueta</span>
          <h1 style={{ fontFamily: 'var(--tt-font-display)', fontSize: isMobile ? 48 : 72, lineHeight: 0.95, fontWeight: 400, letterSpacing: '-0.02em', color: 'white', margin: 0 }}>
            <span style={{ color: 'var(--tt-green-vivid)', marginRight: 4 }}>#</span>{displayName}
          </h1>
          {tag?.count != null && (
            <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
              {tag.count} {tag.count === 1 ? 'artículo' : 'artículos'}
            </p>
          )}
        </div>
      </div>

      <div style={isMobile ? { padding: '0 16px' } : { maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
        <BannerSlot banner={banners['categoria-top']} />
      </div>

      <section style={isMobile
        ? { padding: '16px 16px' }
        : { padding: '32px 40px', maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 56 }
      }>
        <div style={{ position: 'relative' }}>
          {loading && posts.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 20 }}>
              <style>{`@keyframes tt-spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--tt-line-strong)', borderTopColor: 'var(--tt-green)', animation: 'tt-spin 0.75s linear infinite' }} />
              <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink-muted)', letterSpacing: '0.06em' }}>Cargando noticias…</span>
            </div>
          )}

          {loading && posts.length > 0 && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(var(--tt-paper-rgb,245,244,238),0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--tt-line-strong)', borderTopColor: 'var(--tt-green)', animation: 'tt-spin 0.75s linear infinite' }} />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
              <span style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--tt-ink-muted)' }}>Sin noticias disponibles</span>
              <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink-faint)', margin: 0 }}>No hay artículos con esta etiqueta aún.</p>
            </div>
          )}

          {posts.length > 0 && (
            <>
              <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 28 } : { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
                {posts.map(post => <StoryCard key={post.id} story={post} />)}
              </div>
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPage={p => {
                  setSearchParams(p === 1 ? {} : { page: String(p) });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} />
              )}
            </>
          )}
        </div>

        {!isMobile && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <MostReadBox stories={mostRead} />
            <BannerSlot banner={banners['articulo-sidebar']} />
          </aside>
        )}
      </section>

      <div style={isMobile ? { padding: '0 16px' } : { maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
        <BannerSlot banner={banners['categoria-bottom']} />
      </div>

      <Footer />
    </div>
  );
}
