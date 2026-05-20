import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TTLogo from './TTLogo.jsx';
import Icon from './Icon.jsx';

const NAV_MOBILE = [
  { label: 'Recientes', slug: '' },
  { label: 'Sucesos', slug: 'sucesos' },
  { label: 'Política', slug: 'politica' },
  { label: 'Deportes', slug: 'deportes' },
  { label: 'Tucupita', slug: 'tucupita' },
  { label: 'Cultura', slug: 'cultura' },
];

const HeaderMobile = ({ activeCategory = '', theme, setTheme }) => {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  return (
    <header style={{ background: 'var(--tt-paper)', borderBottom: '1px solid var(--tt-line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        <button aria-label="menu" style={{ display: 'inline-flex' }}>
          <Icon name="menu" size={22} />
        </button>
        <Link to="/"><TTLogo size={20} /></Link>
        <span style={{ flex: 1 }} />
        <button aria-label="search" onClick={() => navigate('/buscar')}>
          <Icon name="search" size={20} />
        </button>
        {setTheme && (
          <button
            onClick={setTheme}
            aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--tt-ink-muted)' }}
          >
            {isDark
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        )}
      </div>
      <div style={{
        display: 'flex', gap: 4, padding: '6px 12px 10px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {NAV_MOBILE.map((item) => {
          const isActive = item.slug === activeCategory || (!activeCategory && item.slug === '');
          return (
            <Link
              key={item.label}
              to={item.slug ? `/categoria/${item.slug}` : '/'}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'white' : 'var(--tt-ink-muted)',
                background: isActive ? 'var(--tt-ink)' : 'transparent',
                border: isActive ? 'none' : '1px solid var(--tt-line)',
                borderRadius: 'var(--tt-r-pill)',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default HeaderMobile;
