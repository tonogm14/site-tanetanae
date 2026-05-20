import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

const SectionHead = ({ num, title, italic, href = '#', categorySlug, verTodas = true }) => (
  <div className="tt-section-head">
    <h2>
      {num && (
        <span style={{
          fontFamily: 'var(--tt-font-display)',
          fontStyle: 'italic',
          color: 'var(--tt-ink-faint)',
          marginRight: 14,
          fontSize: '0.7em',
        }}>{num}</span>
      )}
      {title} {italic && <em>{italic}</em>}
    </h2>
    {verTodas && (categorySlug ? (
      <Link to={`/categoria/${categorySlug}`} className="see-all">
        Ver todas <Icon name="arrow" size={12} />
      </Link>
    ) : (
      <a href={href} className="see-all">
        Ver todas <Icon name="arrow" size={12} />
      </a>
    ))}
  </div>
);

export default SectionHead;
