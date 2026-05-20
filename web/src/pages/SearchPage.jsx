import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UtilityStrip from '../components/UtilityStrip.jsx';
import Header from '../components/Header.jsx';
import HeaderMobile from '../components/HeaderMobile.jsx';
import Footer from '../components/Footer.jsx';
import Icon from '../components/Icon.jsx';
import { SkeletonCard } from '../components/LoadingSkeleton.jsx';
import { searchPosts } from '../api/wordpress.js';

const PER_PAGE = 10;
const WINDOW   = 9;

const TRENDING_TAGS = ['#Tucupita', '#LoaTamaronis', '#Deportes2026', '#LácteosDelta', '#Sucesos', '#TenisDeMesa'];

// ── Pagination (same logic as CategoryPage) ───────────────
const Pagination = ({ page, totalPages, onPage }) => {
  const windowStart = Math.floor((page - 1) / WINDOW) * WINDOW + 1;
  const windowEnd   = Math.min(windowStart + WINDOW - 1, totalPages);
  const pages = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  const btn = (extra = {}) => ({
    width: 36, height: 36, borderRadius: 'var(--tt-r-md)',
    border: '1px solid var(--tt-line-strong)',
    background: 'transparent',
    fontFamily: 'var(--tt-font-sans)', fontSize: 14,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--tt-ink)', cursor: 'pointer',
    ...extra,
  });

  return (
    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        style={btn({ opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? 'default' : 'pointer' })}>‹</button>

      {windowStart > 1 && (
        <button onClick={() => onPage(windowStart - 1)} style={btn({ fontSize: 12 })}>···</button>
      )}

      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)} style={btn({
          border: p === page ? 'none' : '1px solid var(--tt-line-strong)',
          background: p === page ? 'var(--tt-ink)' : 'transparent',
          color: p === page ? 'white' : 'var(--tt-ink)',
          fontWeight: p === page ? 700 : 400,
          cursor: p === page ? 'default' : 'pointer',
        })}>{p}</button>
      ))}

      {windowEnd < totalPages && (
        <button onClick={() => onPage(windowEnd + 1)} style={btn({ fontSize: 12 })}>···</button>
      )}

      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        style={btn({ opacity: page === totalPages ? 0.3 : 1, cursor: page === totalPages ? 'default' : 'pointer' })}>›</button>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────
export default function SearchPage({ theme, setTheme }) {
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery]             = useState(searchParams.get('q') || '');
  const [searchTerm, setSearchTerm]   = useState(searchParams.get('q') || '');
  const [page, setPage]               = useState(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [results, setResults]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(false);

  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  // Debounce: query → searchTerm + reset page to 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(query);
      setPage(1);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        return next;
      });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Fetch when searchTerm or page changes
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setTotalPages(1);
      setSearchParams({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSearchParams(page === 1 ? { q: searchTerm } : { q: searchTerm, page: String(page) });

    searchPosts(searchTerm.trim(), page).then(({ results: r, total: t }) => {
      if (cancelled) return;
      setResults(r);
      setTotal(t);
      setTotalPages(Math.max(1, Math.ceil(t / PER_PAGE)));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [searchTerm, page]);

  const goToPage = (p) => {
    setPage(p);
    setSearchParams(p === 1 ? { q: searchTerm } : { q: searchTerm, page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ background: 'var(--tt-paper)', minHeight: '100vh' }}>
      {isMobile ? <HeaderMobile theme={theme} setTheme={setTheme} /> : (
        <>
          <UtilityStrip />
          <Header theme={theme} setTheme={setTheme} />
        </>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '24px 16px' : '48px 24px' }}>
        {/* Search input */}
        <div style={{ marginBottom: 32 }}>
          {!isMobile && (
            <h1 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 48, lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--tt-ink)', marginBottom: 24 }}>
              Buscar <em style={{ color: 'var(--tt-green)' }}>noticias</em>
            </h1>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--tt-white)', border: `2px solid ${query ? 'var(--tt-green)' : 'var(--tt-line)'}`,
            borderRadius: 'var(--tt-r-lg)', padding: '14px 18px', transition: 'border-color 0.2s',
          }}>
            <Icon name="search" size={20} stroke={1.8} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar noticias, autores, lugares…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontFamily: 'var(--tt-font-sans)', fontSize: 16,
                color: 'var(--tt-ink)', background: 'transparent',
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); }} style={{ color: 'var(--tt-ink-faint)' }}>
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Trending tags */}
        {!query && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-ink-muted)', marginBottom: 12 }}>
              Trending esta semana
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRENDING_TAGS.map((t, i) => (
                <button key={t} onClick={() => setQuery(t.replace('#', ''))} style={{
                  padding: '8px 16px', borderRadius: 999,
                  background: i === 0 ? 'var(--tt-ink)' : 'var(--tt-white)',
                  color: i === 0 ? 'white' : 'var(--tt-ink)',
                  border: `1px solid ${i === 0 ? 'var(--tt-ink)' : 'var(--tt-line)'}`,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'var(--tt-font-sans)',
                }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gap: 28, marginTop: 24 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--tt-ink)',
            }}>
              <h2 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 28, fontWeight: 400 }}>
                Resultados <em style={{ color: 'var(--tt-green)' }}>encontrados</em>
              </h2>
              <span className="tt-meta">
                {total} nota{total !== 1 ? 's' : ''} · página {page} de {totalPages}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {results.map(s => (
                <Link key={s.id} to={s.slug ? `/articulo/${s.slug}` : `/articulo/${s.id}`} style={{
                  display: 'grid', gridTemplateColumns: '100px 1fr',
                  gap: 16, paddingBlock: 18, borderBottom: '1px solid var(--tt-line)',
                  textDecoration: 'none',
                }}>
                  <div style={{ borderRadius: 8, overflow: 'hidden' }}>
                    {s.imgUrl
                      ? <img src={s.imgUrl} alt="" style={{ width: 100, height: 80, objectFit: 'cover', display: 'block' }} />
                      : <div className={`tt-img tt-img--${s.img || 'recientes'} tt-aspect-1x1`} style={{ width: '100%' }} />
                    }
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-green)' }}>{s.cat}</span>
                      <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--tt-line-strong)' }} />
                      <span className="tt-meta">{s.date}</span>
                    </div>
                    <h3 className="tt-headline" style={{ fontSize: 20, lineHeight: 1.1, marginBottom: 6 }}>
                      {highlightQuery(s.title, searchTerm)}
                    </h3>
                    {s.excerpt && (
                      <p className="tt-body" style={{ fontSize: 14 }}>
                        {s.excerpt.length > 140 ? s.excerpt.slice(0, 140) + '…' : s.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
            )}
          </div>
        )}

        {/* No results */}
        {!loading && searchTerm && searchTerm.length >= 2 && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--tt-ink-muted)', marginBottom: 12 }}>
              Sin resultados
            </div>
            <p className="tt-body" style={{ fontSize: 14 }}>
              No encontramos notas para "<strong>{searchTerm}</strong>". Prueba con otra búsqueda.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function highlightQuery(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: '#E6F4EB', color: 'var(--tt-green)', padding: 0 }}>{part}</mark>
      : part
  );
}
