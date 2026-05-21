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
import { SkeletonCard } from '../components/LoadingSkeleton.jsx';
import { fetchPosts, fetchBreaking, fetchMostRead, fetchBanners, MOCK_DATA } from '../api/wordpress.js';

const WINDOW = 9;

const Pagination = ({ page, totalPages, onPage }) => {
  // Ventana actual: bloques de 9 (1-9, 10-18, 19-27…)
  const windowStart = Math.floor((page - 1) / WINDOW) * WINDOW + 1;
  const windowEnd   = Math.min(windowStart + WINDOW - 1, totalPages);
  const pages       = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  const btnBase = {
    width: 36, height: 36, borderRadius: 'var(--tt-r-md)',
    border: '1px solid var(--tt-line-strong)',
    background: 'transparent',
    fontFamily: 'var(--tt-font-sans)', fontSize: 14,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--tt-ink)', cursor: 'pointer',
  };

  return (
    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
      {/* Anterior */}
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        style={{ ...btnBase, opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? 'default' : 'pointer' }}>
        ‹
      </button>

      {/* Ventana anterior si existe */}
      {windowStart > 1 && (
        <button onClick={() => onPage(windowStart - 1)} style={{ ...btnBase, fontSize: 12, letterSpacing: '0.05em' }}>
          ···
        </button>
      )}

      {/* Páginas de la ventana */}
      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)} style={{
          ...btnBase,
          border: p === page ? 'none' : '1px solid var(--tt-line-strong)',
          background: p === page ? 'var(--tt-ink)' : 'transparent',
          color: p === page ? 'white' : 'var(--tt-ink)',
          fontWeight: p === page ? 700 : 400,
          cursor: p === page ? 'default' : 'pointer',
        }}>{p}</button>
      ))}

      {/* Ventana siguiente si existe */}
      {windowEnd < totalPages && (
        <button onClick={() => onPage(windowEnd + 1)} style={{ ...btnBase, fontSize: 12, letterSpacing: '0.05em' }}>
          ···
        </button>
      )}

      {/* Siguiente */}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        style={{ ...btnBase, opacity: page === totalPages ? 0.3 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}>
        ›
      </button>
    </div>
  );
};

const CAT_LABELS = {
  'sucesos':              'Sucesos',
  'deportes':             'Deportes',
  'indigenas':            'Indígena',
  'trinidad-y-tobago':    'Trinidad y Tobago',
  'videos':               'Video',
  'opinion':              'Opinión',
  'especiales':           'Especiales',
  'institucionales':      'Institucionales',
  'guyana':               'Guyana',
  'alcaldia-tucupita':    'Alcaldía Tucupita',
  'gobernacion-delta':    'Gobernación Delta',
};

export default function CategoryPage({ theme, setTheme }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [posts, setPosts] = useState([]);
  const [mostRead, setMostRead] = useState(MOCK_DATA.mostRead);
  const [breaking, setBreaking] = useState(MOCK_DATA.breaking);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [banners, setBanners] = useState({});

  // Página derivada directamente de la URL — nunca en estado local.
  // Así no hay setSearchParams programáticos que interfieran con el router.
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page    = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const catLabel = CAT_LABELS[slug] || slug;
  const prevSlug = useRef(slug);

  // Ir a otra categoría: limpiar posts y volver a página 1 en la URL
  useEffect(() => {
    if (prevSlug.current === slug) return;
    prevSlug.current = slug;
    setPosts([]);
    setSearchParams({}, { replace: true });
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchBanners().then(setBanners);

    Promise.allSettled([
      fetchPosts({ page, perPage: 12, category: slug }),
      fetchBreaking(),
      fetchMostRead(),
    ]).then(([postsResult, breakingResult, mostReadResult]) => {
      if (cancelled) return;
      if (postsResult.status === 'fulfilled') {
        setPosts(postsResult.value.posts);
        setTotalPages(postsResult.value.totalPages);
      } else {
        setPosts(MOCK_DATA[slug] || MOCK_DATA.sucesos);
      }
      if (breakingResult.status === 'fulfilled') setBreaking(breakingResult.value);
      if (mostReadResult.status === 'fulfilled') setMostRead(mostReadResult.value);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [slug, page]);

  const CategoryHeader = () => (
    <div style={{
      background: '#0E1116', color: 'white',
      padding: isMobile ? '32px 16px' : '56px 40px',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div className={`tt-img tt-img--${slug}`} style={{
          position: 'absolute', inset: 0, opacity: 0.15,
        }} />
        <span className="tt-eyebrow" style={{ color: 'var(--tt-green-vivid)', marginBottom: 12, display: 'block' }}>
          Sección
        </span>
        <h1 style={{
          fontFamily: 'var(--tt-font-display)',
          fontSize: isMobile ? 48 : 72,
          lineHeight: 0.95,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          color: 'white',
        }}>
          {catLabel}
        </h1>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--tt-paper)', position: 'relative' }}>
      {isMobile ? (
        <>
          <BreakingBar items={breaking} />
          <HeaderMobile activeCategory={slug} theme={theme} setTheme={setTheme} />
        </>
      ) : (
        <>
          <UtilityStrip />
          <BreakingBar items={breaking} />
          <Header activeCategory={slug} theme={theme} setTheme={setTheme} />
        </>
      )}

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <CategoryHeader />
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px' }}>
        <BannerSlot banner={banners['categoria-top']} />
      </div>

      <section style={{ padding: isMobile ? '16px 16px' : '32px 40px', maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: isMobile ? 32 : 56 }}>
        <div style={{ position: 'relative' }}>
          {/* Spinner de carga inicial */}
          {loading && posts.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 20 }}>
              <style>{`@keyframes tt-spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid var(--tt-line-strong)',
                borderTopColor: 'var(--tt-green)',
                animation: 'tt-spin 0.75s linear infinite',
              }} />
              <span style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 13, color: 'var(--tt-ink-muted)', letterSpacing: '0.06em' }}>
                Cargando noticias…
              </span>
            </div>
          )}

          {/* Overlay semitransparente al cambiar página */}
          {loading && posts.length > 0 && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(var(--tt-paper-rgb, 245,244,238), 0.7)',
              backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 60,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid var(--tt-line-strong)',
                borderTopColor: 'var(--tt-green)',
                animation: 'tt-spin 0.75s linear infinite',
              }} />
            </div>
          )}

          {posts.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 28 }}>
                {posts.map(post => (
                  <StoryCard key={post.id} story={post} />
                ))}
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

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px' }}>
        <BannerSlot banner={banners['categoria-bottom']} />
      </div>

      <Footer />
    </div>
  );
}
