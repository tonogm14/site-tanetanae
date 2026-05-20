import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

// ── Image helper ──────────────────────────────────────────────────────────────
const PostImg = ({ post, style = {} }) =>
  post?.imgUrl
    ? <img src={post.imgUrl} alt={post.title || ''} loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }} />
    : <div className={`tt-img tt-img--${post?.img || 'recientes'}`}
        style={{ width: '100%', height: '100%', ...style }} />;

// ── Accent section header ─────────────────────────────────────────────────────
const SectionBar = ({ accent = 'var(--tt-ink)', eyebrow, title, categorySlug }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24,
    borderTop: `3px solid ${accent}`,
    paddingTop: 14, marginBottom: 24, flexWrap: 'wrap',
  }}>
    <h2 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 42, lineHeight: 1, fontWeight: 400, margin: 0 }}>
      <span style={{
        fontFamily: 'var(--tt-font-sans)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: accent, marginRight: 14, verticalAlign: 'middle',
      }}>{eyebrow} ·</span>
      {title}
    </h2>
    {categorySlug && (
      <Link to={`/categoria/${categorySlug}`} style={{
        fontFamily: 'var(--tt-font-sans)', fontSize: 12, fontWeight: 500,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--tt-ink-muted)',
        display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
      }}>
        Toda la sección <Icon name="arrow" size={12} />
      </Link>
    )}
  </div>
);

// ── Skeleton pulse div ────────────────────────────────────────────────────────
const Sk = ({ style }) => (
  <div style={{ background: 'var(--tt-paper-2)', animation: 'ttSkeletonPulse 1.6s ease-in-out infinite', borderRadius: 6, ...style }} />
);

/* ═══════════════════════════════════════════════════════════════════════════
   SUCESOS BLOCK — Desktop
   Barra roja + 1 nota grande + lista tipo parte policial + rail de temas
═══════════════════════════════════════════════════════════════════════════ */
export const SucesosBlock = ({ posts = [], loading = false }) => {
  if (loading) {
    return (
      <section style={{ marginTop: 56 }}>
        <div style={{ borderTop: '3px solid var(--tt-breaking)', paddingTop: 14, marginBottom: 24 }}>
          <Sk style={{ height: 42, width: 220, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 36 }}>
          <Sk style={{ aspectRatio: '3/2', borderRadius: 'var(--tt-r-md)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3,4].map(i => <Sk key={i} style={{ height: 72 }} />)}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;
  const [main, ...rest] = posts;
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))].slice(0, 8);

  return (
    <section style={{ marginTop: 56 }}>
      <SectionBar accent="var(--tt-breaking)" eyebrow="Sección" title="Sucesos" categorySlug="sucesos" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 36 }}>
        {/* Lead */}
        <Link to={`/${main.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ borderRadius: 'var(--tt-r-md)', overflow: 'hidden', marginBottom: 16, aspectRatio: '3/2' }}>
            <PostImg post={main} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span className="tt-chip" style={{ background: 'var(--tt-breaking)', color: 'white' }}>Sucesos</span>
            <span className="tt-meta">{main.date}</span>
          </div>
          <h3 className="tt-headline" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: 12 }}>{main.title}</h3>
          {main.excerpt && <p className="tt-body" style={{ fontSize: 15 }}>{main.excerpt}</p>}
        </Link>

        {/* Secondary list */}
        <div style={{ borderLeft: '1px solid var(--tt-line)', paddingLeft: 24 }}>
          {rest.slice(0, 4).map((s, i) => (
            <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{
                display: 'grid', gridTemplateColumns: '88px 1fr', gap: 14,
                paddingBottom: 16, marginBottom: 16,
                borderBottom: i < Math.min(rest.length, 4) - 1 ? '1px solid var(--tt-line)' : 'none',
                alignItems: 'start',
              }}>
                <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1' }}>
                  <PostImg post={s} />
                </div>
                <div>
                  <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.15, marginBottom: 6 }}>{s.title}</h4>
                  {s.excerpt && (
                    <p className="tt-body" style={{ fontSize: 13, color: 'var(--tt-ink-muted)' }}>
                      {s.excerpt.length > 80 ? s.excerpt.slice(0, 80).trimEnd() + '…' : s.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Topic tag rail — only shown when posts have tags */}
      {allTags.length > 0 && (
        <div style={{
          marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--tt-line)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontFamily: 'var(--tt-font-sans)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--tt-ink-muted)', marginRight: 6,
          }}>Temas:</span>
          {allTags.map(t => (
            <span key={t} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 11px', border: '1px solid var(--tt-line-strong)',
              borderRadius: 'var(--tt-r-pill)', fontFamily: 'var(--tt-font-sans)',
              fontSize: 12, fontWeight: 500, color: 'var(--tt-ink-muted)',
            }}>#{t}</span>
          ))}
        </div>
      )}
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DEPORTES BLOCK — Desktop
   Header con mini-scoreboard + lead grande + grilla 2×2
═══════════════════════════════════════════════════════════════════════════ */
export const DeportesBlock = ({ posts = [], loading = false }) => {
  if (loading) {
    return (
      <section style={{ marginTop: 64 }}>
        <div style={{ borderTop: '3px solid var(--tt-green)', paddingTop: 14, marginBottom: 24, height: 56 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 36 }}>
          <Sk style={{ aspectRatio: '3/2', borderRadius: 'var(--tt-r-md)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {[1,2,3,4].map(i => <Sk key={i} style={{ aspectRatio: '16/9' }} />)}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;
  const [lead, ...more] = posts;

  return (
    <section style={{ marginTop: 64 }}>
      <SectionBar accent="var(--tt-green)" eyebrow="Sección" title="Deportes" categorySlug="deportes" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 36 }}>
        {/* Lead */}
        <Link to={`/${lead.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ borderRadius: 'var(--tt-r-md)', overflow: 'hidden', marginBottom: 16, aspectRatio: '3/2' }}>
            <PostImg post={lead} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span className="tt-chip">Deportes</span>
            <span className="tt-meta">{lead.date}</span>
          </div>
          <h3 className="tt-headline" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: 12 }}>{lead.title}</h3>
          {lead.excerpt && <p className="tt-body" style={{ fontSize: 15 }}>{lead.excerpt}</p>}
        </Link>

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignContent: 'start' }}>
          {more.slice(0, 4).map(s => (
            <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              <article>
                <div style={{ borderRadius: 6, overflow: 'hidden', marginBottom: 10, aspectRatio: '16/9' }}>
                  <PostImg post={s} />
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--tt-green)',
                }}>Deportes · {s.date}</span>
                <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.15, marginTop: 6 }}>{s.title}</h4>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PUEBLOS DEL DELTA — Desktop
   Banda oscura editorial con cita + tabla de municipios + 3-col stories
═══════════════════════════════════════════════════════════════════════════ */
export const PueblosDelDeltaBlock = ({ posts = [], loading = false }) => {
  if (loading) {
    return (
      <section style={{ marginTop: 64 }}>
        <Sk style={{ height: 380, borderRadius: 'var(--tt-r-lg)', marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {[1,2,3].map(i => <Sk key={i} style={{ aspectRatio: '3/2', borderRadius: 6 }} />)}
        </div>
      </section>
    );
  }

  if (!posts.length) return null;
  const [main, ...more] = posts;


  return (
    <section style={{ marginTop: 64 }}>
      {/* Dark editorial band */}
      <div style={{
        background: '#1A1410', color: 'white',
        borderRadius: 'var(--tt-r-lg)',
        padding: '44px 44px 36px',
        position: 'relative', overflow: 'hidden',
        marginBottom: 32,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 85% 60%, rgba(196,129,104,0.22), transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 30,
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 18' preserveAspectRatio='none'><path d='M0 9 Q15 0 30 9 T60 9 T90 9 T120 9' fill='none' stroke='%23C48168' stroke-width='1.2'/></svg>\")",
          backgroundRepeat: 'repeat-x', backgroundSize: '120px 18px', opacity: 0.35,
        }} />

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 44, alignItems: 'stretch' }}>
          {/* Left — lead article */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{
                fontFamily: 'var(--tt-font-sans)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C48168',
              }}>Pueblos del Delta · Cobertura especial</span>
              <span style={{ width: 40, height: 1, background: 'rgba(196,129,104,0.4)', flexShrink: 0 }} />
            </div>

            {main.date && (
              <span style={{
                fontFamily: 'var(--tt-font-sans)', fontSize: 11,
                color: 'rgba(255,255,255,0.5)', marginBottom: 14,
              }}>{main.date}</span>
            )}

            <h3 className="tt-headline" style={{ color: 'white', fontSize: 34, lineHeight: 1.05, marginBottom: 16, maxWidth: '28ch' }}>
              {main.title}
            </h3>
            {main.excerpt && (
              <p style={{
                fontFamily: 'var(--tt-font-sans)', fontSize: 14, lineHeight: 1.55,
                color: 'rgba(255,255,255,0.7)', maxWidth: '56ch', marginBottom: 22,
              }}>{main.excerpt}</p>
            )}

            <span style={{ flex: 1 }} />
            <Link to={`/${main.slug}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 'var(--tt-r-pill)',
              background: '#C48168', color: '#1A1410',
              fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', alignSelf: 'flex-start',
            }}>
              Leer cobertura completa <Icon name="arrow" size={13} />
            </Link>
          </div>

          {/* Right: next 3 stories stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {more.slice(0, 3).map((s, i) => (
              <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr', gap: 14,
                  paddingBlock: 18,
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  alignItems: 'start',
                }}>
                  <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1' }}>
                    <PostImg post={s} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: '#C48168', display: 'block', marginBottom: 6,
                    }}>Indígenas · {s.date}</span>
                    <h4 className="tt-headline" style={{ color: 'white', fontSize: 15, lineHeight: 1.2, marginBottom: 6 }}>{s.title}</h4>
                    {s.excerpt && (
                      <p style={{ fontFamily: 'var(--tt-font-sans)', fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,0.6)' }}>
                        {s.excerpt.length > 80 ? s.excerpt.slice(0, 80).trimEnd() + '…' : s.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNACIONAL FRONTERA — Desktop
   Trinidad y Tobago + Guyana en columnas con bandera + lead + lista
═══════════════════════════════════════════════════════════════════════════ */
const CountryColumn = ({ country, subtitle, colors, stories = [], categorySlug }) => {
  if (!stories.length) return null;
  const [lead, ...more] = stories;

  return (
    <div style={{
      border: '1px solid var(--tt-line)', borderRadius: 'var(--tt-r-lg)',
      background: 'var(--tt-white)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 20px', borderBottom: '1px solid var(--tt-line)',
        background: 'var(--tt-paper-2)',
      }}>
        <div style={{
          display: 'flex', width: 34, height: 22,
          borderRadius: 3, overflow: 'hidden',
          border: '1px solid var(--tt-line-strong)', flexShrink: 0,
        }}>
          {colors.map((c, i) => <span key={i} style={{ flex: 1, background: c }} />)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--tt-font-display)', fontStyle: 'italic', fontSize: 22, fontWeight: 400, lineHeight: 1 }}>
            {country}
          </div>
          <div className="tt-meta" style={{ fontSize: 11, marginTop: 2 }}>{subtitle}</div>
        </div>
        {categorySlug && (
          <Link to={`/categoria/${categorySlug}`} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--tt-green)',
            display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none',
          }}>
            Sección <Icon name="arrow" size={11} />
          </Link>
        )}
      </header>

      {/* Lead */}
      <Link to={`/${lead.slug}`} className="tt-card-link" style={{ display: 'block', padding: '20px 20px 18px', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16 }}>
          <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1' }}>
            <PostImg post={lead} />
          </div>
          <div>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--tt-ink-muted)',
            }}>Más reciente · {lead.date}</span>
            <h4 className="tt-headline" style={{ fontSize: 20, lineHeight: 1.1, marginTop: 8, marginBottom: 8 }}>
              {lead.title}
            </h4>
            {lead.excerpt && <p className="tt-body" style={{ fontSize: 13, lineHeight: 1.5 }}>{lead.excerpt}</p>}
          </div>
        </div>
      </Link>

      {/* List */}
      {more.length > 0 && (
        <div style={{ borderTop: '1px dashed var(--tt-line)' }}>
          {more.slice(0, 3).map((s, i) => (
            <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{
              display: 'grid', gridTemplateColumns: '64px 1fr',
              gap: 14, padding: '13px 20px',
              borderBottom: i < Math.min(more.length, 3) - 1 ? '1px dashed var(--tt-line)' : 'none',
              alignItems: 'start', textDecoration: 'none', color: 'inherit',
            }}>
              <span style={{
                fontFamily: 'var(--tt-font-mono)', fontSize: 10, fontWeight: 600,
                color: 'var(--tt-ink-faint)', paddingTop: 2, letterSpacing: '0.04em',
              }}>{s.date}</span>
              <h5 className="tt-headline" style={{ fontSize: 14, lineHeight: 1.2 }}>{s.title}</h5>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const InternacionalFronteraBlock = ({ trinidadPosts = [], guyanaPosts = [], loading = false }) => {
  if (loading) {
    return (
      <section style={{ marginTop: 64 }}>
        <div style={{ borderTop: '3px solid var(--tt-ink)', paddingTop: 14, marginBottom: 24, height: 56 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[1,2].map(i => <Sk key={i} style={{ height: 380, borderRadius: 'var(--tt-r-lg)' }} />)}
        </div>
      </section>
    );
  }

  if (!trinidadPosts.length && !guyanaPosts.length) return null;

  return (
    <section style={{ marginTop: 64 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24,
        borderTop: '3px solid var(--tt-ink)',
        paddingTop: 14, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <h2 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 42, lineHeight: 1, fontWeight: 400, margin: 0 }}>
          <span style={{
            fontFamily: 'var(--tt-font-sans)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--tt-ink-muted)', marginRight: 14, verticalAlign: 'middle',
          }}>Internacional ·</span>
          Frontera
        </h2>
        <span className="tt-meta" style={{ fontStyle: 'italic' }}>
          Deltanos en el exterior · cobertura desde el Caribe y la Esequiba
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: trinidadPosts.length && guyanaPosts.length ? '1fr 1fr' : '1fr', gap: 24 }}>
        <CountryColumn
          country="Trinidad y Tobago"
          subtitle="Golfo de Paria · Puerto España"
          colors={['#CE1126', '#000000', '#FFFFFF', '#000000', '#CE1126']}
          stories={trinidadPosts}
          categorySlug="trinidad-y-tobago"
        />
        <CountryColumn
          country="Guyana"
          subtitle="Frontera Esequiba · Georgetown"
          colors={['#009E49', '#FFFFFF', '#FFD100', '#000000', '#CE1126']}
          stories={guyanaPosts}
          categorySlug="guyana"
        />
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE VERSIONS
═══════════════════════════════════════════════════════════════════════════ */

export const SucesosMobile = ({ posts = [], loading = false }) => {
  if (loading || !posts.length) return null;
  const [main, ...rest] = posts;

  return (
    <section>
      <div style={{ borderTop: '3px solid var(--tt-breaking)', paddingTop: 10, marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--tt-font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tt-breaking)',
        }}>Sección</span>
        <h2 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 32, lineHeight: 1, fontWeight: 400, marginTop: 4 }}>Sucesos</h2>
      </div>

      <Link to={`/${main.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 18 }}>
        <div style={{ borderRadius: 'var(--tt-r-md)', overflow: 'hidden', marginBottom: 12, aspectRatio: '16/9' }}>
          <PostImg post={main} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-breaking)' }}>
          Sucesos · {main.date}
        </span>
        <h3 className="tt-headline" style={{ fontSize: 22, lineHeight: 1.12, marginTop: 6, marginBottom: 8 }}>{main.title}</h3>
        {main.excerpt && <p className="tt-body" style={{ fontSize: 14 }}>{main.excerpt}</p>}
      </Link>

      {rest.slice(0, 3).map(s => (
        <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{
          display: 'grid', gridTemplateColumns: '92px 1fr', gap: 12,
          paddingBlock: 14, borderTop: '1px solid var(--tt-line)',
          alignItems: 'start', textDecoration: 'none', color: 'inherit',
        }}>
          <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1' }}>
            <PostImg post={s} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--tt-font-mono)', fontSize: 10,
              color: 'var(--tt-breaking)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4,
            }}>{s.time || s.date}</div>
            <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.15 }}>{s.title}</h4>
          </div>
        </Link>
      ))}
    </section>
  );
};

export const DeportesMobile = ({ posts = [], loading = false }) => {
  if (loading || !posts.length) return null;
  const [lead, ...more] = posts;

  return (
    <section>
      <div style={{
        borderTop: '3px solid var(--tt-green)', paddingTop: 10, marginBottom: 14,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--tt-font-sans)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tt-green)',
          }}>Sección</span>
          <h2 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 32, lineHeight: 1, fontWeight: 400, marginTop: 4 }}>Deportes</h2>
        </div>
        <Link to="/categoria/deportes" style={{ fontSize: 11, color: 'var(--tt-green)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, paddingBottom: 4 }}>
          Ver todas <Icon name="arrow" size={11} />
        </Link>
      </div>

      <Link to={`/${lead.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 14 }}>
        <div style={{ borderRadius: 'var(--tt-r-md)', overflow: 'hidden', marginBottom: 12, aspectRatio: '16/9' }}>
          <PostImg post={lead} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-green)' }}>
          Deportes · {lead.date}
        </span>
        <h3 className="tt-headline" style={{ fontSize: 22, lineHeight: 1.12, marginTop: 6, marginBottom: 8 }}>{lead.title}</h3>
        {lead.excerpt && <p className="tt-body" style={{ fontSize: 14 }}>{lead.excerpt}</p>}
      </Link>

      {more.slice(0, 3).map(s => (
        <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{
          display: 'grid', gridTemplateColumns: '92px 1fr', gap: 12,
          paddingBlock: 14, borderTop: '1px solid var(--tt-line)',
          textDecoration: 'none', color: 'inherit',
        }}>
          <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1' }}>
            <PostImg post={s} />
          </div>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-green)' }}>Deportes</span>
            <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.15, marginTop: 4 }}>{s.title}</h4>
          </div>
        </Link>
      ))}
    </section>
  );
};

export const PueblosDelDeltaMobile = ({ posts = [], loading = false }) => {
  if (loading || !posts.length) return null;
  const [main, ...more] = posts;

  return (
    <section>
      {/* Dark band — full-bleed via negative margin */}
      <div style={{
        background: '#1A1410', color: 'white',
        margin: '0 -16px', padding: '32px 20px 28px',
      }}>
        <span style={{
          fontFamily: 'var(--tt-font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C48168',
        }}>Pueblos del Delta · Especial</span>
        {main.date && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 10, marginBottom: 8 }}>{main.date}</div>
        )}
        <Link to={`/${main.slug}`} className="tt-card-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <h3 className="tt-headline" style={{ color: 'white', fontSize: 17, lineHeight: 1.2, marginBottom: 8 }}>{main.title}</h3>
          {main.excerpt && (
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>{main.excerpt}</p>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 'var(--tt-r-pill)',
            background: '#C48168', color: '#1A1410',
            fontFamily: 'var(--tt-font-sans)', fontSize: 13, fontWeight: 600,
          }}>
            Cobertura completa <Icon name="arrow" size={12} />
          </span>
        </Link>
      </div>

      {more.length > 0 && (
        <div style={{ paddingTop: 4 }}>
          {more.slice(0, 2).map(s => (
            <Link key={s.id} to={`/${s.slug}`} className="tt-card-link" style={{
              display: 'grid', gridTemplateColumns: '92px 1fr', gap: 12,
              paddingBlock: 14, borderBottom: '1px solid var(--tt-line)',
              textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1' }}>
                <PostImg post={s} />
              </div>
              <div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A4F3E' }}>
                  Indígenas · {s.date}
                </span>
                <h4 className="tt-headline" style={{ fontSize: 16, lineHeight: 1.15, marginTop: 4 }}>{s.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export const InternacionalFronteraMobile = ({ trinidadPosts = [], guyanaPosts = [], loading = false }) => {
  if (loading || (!trinidadPosts.length && !guyanaPosts.length)) return null;

  return (
    <section>
      <div style={{ borderTop: '3px solid var(--tt-ink)', paddingTop: 10, marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--tt-font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tt-ink-muted)',
        }}>Internacional</span>
        <h2 style={{ fontFamily: 'var(--tt-font-display)', fontSize: 32, lineHeight: 1, fontWeight: 400, marginTop: 4 }}>Frontera</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {trinidadPosts.length > 0 && (
          <CountryColumn
            country="Trinidad y Tobago"
            subtitle="Golfo de Paria · Puerto España"
            colors={['#CE1126', '#000000', '#FFFFFF', '#000000', '#CE1126']}
            stories={trinidadPosts}
            categorySlug="trinidad-y-tobago"
          />
        )}
        {guyanaPosts.length > 0 && (
          <CountryColumn
            country="Guyana"
            subtitle="Esequiba · Georgetown"
            colors={['#009E49', '#FFFFFF', '#FFD100', '#000000', '#CE1126']}
            stories={guyanaPosts}
            categorySlug="guyana"
          />
        )}
      </div>
    </section>
  );
};
