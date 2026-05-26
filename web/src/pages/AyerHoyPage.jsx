import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UtilityStrip from '../components/UtilityStrip.jsx';
import BreakingBar from '../components/BreakingBar.jsx';
import Header from '../components/Header.jsx';
import HeaderMobile from '../components/HeaderMobile.jsx';
import StoryCard from '../components/StoryCard.jsx';
import Footer from '../components/Footer.jsx';
import { fetchRecent, fetchBreaking } from '../api/wordpress.js';
import { MOCK_DATA } from '../api/wordpress.js';

const TABS = [
  { key: 'today',     label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
];

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
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        style={{ ...btn, opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? 'default' : 'pointer' }}>‹</button>
      {windowStart > 1 && <button onClick={() => onPage(windowStart - 1)} style={{ ...btn, fontSize: 12 }}>···</button>}
      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)} style={{
          ...btn,
          border: p === page ? 'none' : '1px solid var(--tt-line-strong)',
          background: p === page ? 'var(--tt-ink)' : 'transparent',
          color: p === page ? 'white' : 'var(--tt-ink)',
          fontWeight: p === page ? 700 : 400,
          cursor: p === page ? 'default' : 'pointer',
        }}>{p}</button>
      ))}
      {windowEnd < totalPages && <button onClick={() => onPage(windowEnd + 1)} style={{ ...btn, fontSize: 12 }}>···</button>}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        style={{ ...btn, opacity: page === totalPages ? 0.3 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}>›</button>
    </div>
  );
};

export default function AyerHoyPage({ theme, setTheme }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [breaking, setBreaking] = useState(MOCK_DATA.breaking);

  const rawTab  = searchParams.get('tab');
  const activeTab = rawTab === 'yesterday' ? 'yesterday' : 'today';
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page    = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    document.title = 'Ayer y Hoy · Tane Tanae';
    return () => { document.title = 'Tane Tanae · Así pasó'; };
  }, []);

  useEffect(() => {
    fetchBreaking().then(setBreaking);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    window.scrollTo({ top: 0 });
    fetchRecent({ day: activeTab, page, fill: true }).then(({ posts: p, totalPages: tp }) => {
      if (cancelled) return;
      setPosts(p);
      setTotalPages(tp);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab, page]);

  function setTab(key) {
    setSearchParams({ tab: key });
    setPosts([]);
  }

  function setPage(p) {
    const params = { tab: activeTab };
    if (p > 1) params.page = String(p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const tabStyle = (key) => ({
    padding: isMobile ? '10px 20px' : '12px 28px',
    fontFamily: 'var(--tt-font-sans)', fontSize: isMobile ? 14 : 15, fontWeight: 600,
    borderRadius: 'var(--tt-r-pill)',
    border: 'none', cursor: 'pointer',
    background: activeTab === key ? 'var(--tt-green-vivid)' : 'rgba(255,255,255,0.12)',
    color: activeTab === key ? 'var(--tt-ink)' : 'rgba(255,255,255,0.8)',
    transition: 'background 0.2s, color 0.2s',
  });

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

      {/* Page header */}
      <div style={{ background: '#0E1116', color: 'white', padding: isMobile ? '32px 16px 28px' : '56px 40px 48px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <span className="tt-eyebrow" style={{ color: 'var(--tt-green-vivid)', marginBottom: 12, display: 'block' }}>
            Noticias recientes
          </span>
          <h1 style={{
            fontFamily: 'var(--tt-font-display)', fontWeight: 400,
            fontSize: isMobile ? 44 : 68, lineHeight: 0.95, letterSpacing: '-0.02em',
            color: 'white', marginBottom: 28,
          }}>
            Ayer y Hoy
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={tabStyle(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '24px 16px 64px' : '40px 40px 80px' }}>

        {loading && posts.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 20 }}>
            <style>{`@keyframes tt-spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid var(--tt-line-strong)', borderTopColor: 'var(--tt-green)',
              animation: 'tt-spin 0.75s linear infinite',
            }} />
            <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink-muted)', letterSpacing: '0.06em' }}>
              Cargando noticias…
            </span>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--tt-ink-muted)' }}>
              No hay noticias publicadas {activeTab === 'today' ? 'hoy' : 'ayer'} todavía.
            </p>
          </div>
        )}

        {loading && posts.length > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(var(--tt-paper-rgb,245,244,238),0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--tt-line-strong)', borderTopColor: 'var(--tt-green)', animation: 'tt-spin 0.75s linear infinite' }} />
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <>
            {/* Count */}
            <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, color: 'var(--tt-ink-faint)', letterSpacing: '0.06em', marginBottom: 28 }}>
              {activeTab === 'today' ? 'HOY' : 'AYER'} · {posts.length > 0 ? `mostrando página ${page}` : ''}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 28 }}>
              {posts.map(post => <StoryCard key={post.id} story={post} />)}
            </div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
