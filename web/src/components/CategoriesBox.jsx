import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

const CategoriesBox = ({ cats = [] }) => (
  <div>
    <div style={{ borderTop: '2px solid var(--tt-ink)', paddingTop: 12, marginBottom: 14 }}>
      <h3 style={{
        fontFamily: 'var(--tt-font-display)',
        fontSize: 24, fontWeight: 400, lineHeight: 1,
      }}>
        Explorar <em style={{ color: 'var(--tt-green)' }}>secciones</em>
      </h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {cats.map((c) => (
        <Link
          key={c.slug}
          to={`/categoria/${c.slug}`}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--tt-r-md)',
            background: 'var(--tt-paper-2)',
            fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textDecoration: 'none',
            color: 'var(--tt-ink)',
            transition: 'background 0.15s',
          }}
        >
          <span>{c.name}</span>
          <Icon name="arrow_up_right" size={12} stroke={2} />
        </Link>
      ))}
    </div>
  </div>
);

export default CategoriesBox;
