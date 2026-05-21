import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TTLogo from './TTLogo.jsx';
import Icon from './Icon.jsx';
import { SOCIALS } from '../lib/socials.js';

const NAV = [
  { label: 'Inicio',            href: '/' },
  { label: 'Ayer y Hoy',        href: '/tanetanae-noticias-de-ayer-y-hoy', special: true },
  { label: 'Sucesos',           href: '/categoria/sucesos' },
  { label: 'Deportes',          href: '/categoria/deportes' },
  { label: 'Indígena',          href: '/categoria/indigenas' },
  { label: 'Trinidad y Tobago', href: '/categoria/trinidad-y-tobago' },
  { label: 'Video',             href: '/categoria/videos' },
  { label: 'Opinión',           href: '/categoria/opinion' },
];

const Header = ({ compact = false, activeCategory = '', theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';

  return (
    <header style={{ background: 'var(--tt-paper)', borderBottom: '1px solid var(--tt-line)', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: compact ? '14px 40px' : '20px 40px', borderBottom: '1px solid var(--tt-line)', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/"><TTLogo size={compact ? 28 : 34} /></Link>
        <div style={{ flex: 1 }} />
        <button
          className="tt-btn tt-btn--ghost"
          style={{ paddingBlock: 8, paddingInline: 14, fontSize: 12 }}
          onClick={() => navigate('/buscar')}
        >
          <Icon name="search" size={14} /> Buscar
        </button>
        {setTheme && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: '1px solid var(--tt-line-strong)',
              background: 'var(--tt-paper-2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--tt-ink-muted)',
              transition: 'background 0.2s',
            }}
          >
            {isDark
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        )}
        {SOCIALS.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {SOCIALS.map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank" rel="noopener noreferrer"
                title={name.charAt(0).toUpperCase() + name.slice(1)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: '1px solid var(--tt-line-strong)',
                  background: 'var(--tt-paper-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--tt-ink-muted)', textDecoration: 'none',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <Icon name={name} size={15} />
              </a>
            ))}
          </div>
        )}
      </div>
      <nav style={{
        display: 'flex', gap: 0, alignItems: 'stretch',
        maxWidth: 1440, margin: '0 auto', padding: '0 40px',
        fontFamily: 'var(--tt-font-sans)', overflow: 'hidden',
      }}>
        {NAV.map((item) => {
          const isActive = item.href === '/'
            ? location.pathname === '/' && !activeCategory
            : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              style={{
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.01em',
                color: isActive
                  ? (item.special ? 'var(--tt-green-vivid)' : 'var(--tt-ink)')
                  : (item.special ? 'var(--tt-green)' : 'var(--tt-ink-muted)'),
                borderBottom: isActive ? `2px solid ${item.special ? 'var(--tt-green-vivid)' : 'var(--tt-green)'}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}
        <span style={{ flex: 1 }} />
      </nav>
    </header>
  );
};

export default Header;
