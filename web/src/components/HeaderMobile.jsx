import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TTLogo from './TTLogo.jsx';
import Icon from './Icon.jsx';
import { SOCIALS } from '../lib/socials.js';

const NAV_MOBILE = [
  { label: 'Inicio',            href: '/' },
  { label: 'Ayer y Hoy',        href: '/tanetanae-noticias-de-ayer-y-hoy', special: true },
  { label: 'Sucesos',           href: '/categoria/sucesos' },
  { label: 'Política',          href: '/categoria/politica' },
  { label: 'Deportes',          href: '/categoria/deportes' },
  { label: 'Tucupita',          href: '/categoria/tucupita' },
  { label: 'Cultura',           href: '/categoria/cultura' },
  { label: 'Salud',             href: '/categoria/salud' },
  { label: 'Indígenas',         href: '/categoria/indigenas' },
  { label: 'Trinidad y Tobago', href: '/categoria/trinidad-y-tobago' },
  { label: 'Opinión',           href: '/categoria/opinion' },
  { label: 'Especiales',        href: '/categoria/especiales' },
];

const PILL_TABS = [
  { label: 'Recientes', href: '/' },
  { label: 'Ayer y Hoy', href: '/tanetanae-noticias-de-ayer-y-hoy', special: true },
  { label: 'Sucesos',   href: '/categoria/sucesos' },
  { label: 'Deportes',  href: '/categoria/deportes' },
  { label: 'Indígenas', href: '/categoria/indigenas' },
  { label: 'Video',     href: '/categoria/videos' },
];

const HeaderMobile = ({ activeCategory = '', theme, setTheme }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const isDark     = theme === 'dark';
  const [open, setOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header style={{ background: 'var(--tt-paper)', borderBottom: '1px solid var(--tt-line)', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <button aria-label="Abrir menú" onClick={() => setOpen(true)}
            style={{ display: 'inline-flex', color: 'var(--tt-ink)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="menu" size={22} />
          </button>
          <Link to="/"><TTLogo size={20} /></Link>
          <span style={{ flex: 1 }} />
          <button aria-label="Buscar" onClick={() => navigate('/buscar')}
            style={{ display: 'inline-flex', color: 'var(--tt-ink)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="search" size={20} />
          </button>
          {setTheme && (
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
              style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--tt-ink-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {isDark
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          )}
        </div>

        {/* Category pill tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {PILL_TABS.map((item) => {
            const isActive = item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);
            return (
              <Link key={item.label} to={item.href}
                style={{
                  padding: '6px 12px', fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--tt-paper)' : item.special ? 'var(--tt-green)' : 'var(--tt-ink-muted)',
                  background: isActive ? (item.special ? 'var(--tt-green-vivid)' : 'var(--tt-ink)') : 'transparent',
                  border: isActive ? 'none' : `1px solid ${item.special ? 'var(--tt-green-line)' : 'var(--tt-line)'}`,
                  borderRadius: 'var(--tt-r-pill)',
                  whiteSpace: 'nowrap', textDecoration: 'none',
                }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(0,0,0,0.45)',
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 280, zIndex: 100,
        background: 'var(--tt-paper)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--tt-line)' }}>
          <TTLogo size={20} />
          <button onClick={() => setOpen(false)} aria-label="Cerrar menú"
            style={{ display: 'inline-flex', color: 'var(--tt-ink-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_MOBILE.map((item) => {
            const isActive = item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);
            const accent = item.special ? 'var(--tt-green-vivid)' : 'var(--tt-green)';
            return (
              <Link key={item.label} to={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 20px',
                fontSize: 16, fontWeight: isActive ? 600 : 400,
                color: isActive ? accent : 'var(--tt-ink)',
                borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                textDecoration: 'none',
                background: isActive ? 'var(--tt-green-soft)' : 'transparent',
              }}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--tt-line)' }}>
          {SOCIALS.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {SOCIALS.map(({ name, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1px solid var(--tt-line-strong)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--tt-ink-muted)',
                  }}>
                  <Icon name={name} size={15} />
                </a>
              ))}
            </div>
          )}
          <p style={{ fontSize: 11, color: 'var(--tt-ink-faint)', letterSpacing: '0.02em' }}>
            © 2026 Tanetanae · Tucupita
          </p>
        </div>
      </div>
    </>
  );
};

export default HeaderMobile;
