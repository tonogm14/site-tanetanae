import React from 'react';
import StoryRow from './StoryRow.jsx';

const MostReadBox = ({ stories = [] }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderTop: '2px solid var(--tt-ink)',
      paddingTop: 12, marginBottom: 8,
    }}>
      <h3 style={{
        fontFamily: 'var(--tt-font-display)',
        fontSize: 24, lineHeight: 1, fontWeight: 400,
      }}>
        Lo más <em style={{ color: 'var(--tt-green)' }}>leído</em>
      </h3>
      <span style={{
        fontFamily: 'var(--tt-font-sans)', fontSize: 10,
        fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--tt-ink-muted)',
        background: 'var(--tt-paper-2)', padding: '3px 8px',
        borderRadius: 'var(--tt-r-pill)',
      }}>Semana</span>
    </div>
    {stories.map((s, idx) => (
      <StoryRow key={s.id} story={s} index={idx + 1} />
    ))}
  </div>
);

export default MostReadBox;
