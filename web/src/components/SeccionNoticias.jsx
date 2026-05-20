import React from 'react';
import { useNotasByCategory } from '../hooks/useNotasByCategory.js';
import { HIDDEN_CAT_SLUGS } from '../lib/wp-categories.js';
import HeroMosaic from './HeroMosaic.jsx';
import StoryCard from './StoryCard.jsx';
import FeatureRow from './FeatureRow.jsx';
import StoryRow from './StoryRow.jsx';
import SectionHead from './SectionHead.jsx';
import { SkeletonCard, SkeletonRow } from './LoadingSkeleton.jsx';

// --- Sub-componentes internos ---

const EmptyState = ({ titulo }) => (
  <div style={{
    padding: '32px 0',
    color: 'var(--tt-ink-faint)',
    fontFamily: 'var(--tt-font-sans)',
    fontSize: 14,
    textAlign: 'center',
    border: '1px dashed var(--tt-line)',
    borderRadius: 'var(--tt-r-md)',
  }}>
    Sin notas en <em>{titulo}</em> por el momento.
  </div>
);

// Grilla de tarjetas: 3-col escritorio, 1-col móvil
const LayoutGrid = ({ posts, isMobile }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
    gap: isMobile ? 20 : 28,
  }}>
    {posts.map(p => <StoryCard key={p.id} story={p} />)}
  </div>
);

// Grilla 2-col para secciones medianas (deportes, video…)
const LayoutGrid2 = ({ posts, isMobile }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? 20 : 28,
  }}>
    {posts.map(p => <StoryCard key={p.id} story={p} size="lg" />)}
  </div>
);

// Lista de filas con imagen a la izquierda (más compacto)
const LayoutList = ({ posts }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {posts.map(p => <FeatureRow key={p.id} story={p} />)}
  </div>
);

// Lista ultra-compacta sin imagen — para sidebar o secciones secundarias
const LayoutCompact = ({ posts }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {posts.map(p => <StoryRow key={p.id} story={p} showImage={false} />)}
  </div>
);

// Layout de video: grilla 2-col con badge "▶ Video" superpuesto
const LayoutVideo = ({ posts, isMobile }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? 20 : 28,
  }}>
    {posts.map(p => (
      <div key={p.id} style={{ position: 'relative' }}>
        <StoryCard story={p} size="lg" />
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,0.72)', color: 'white',
          fontSize: 11, fontWeight: 700,
          padding: '4px 10px', borderRadius: 'var(--tt-r-pill)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          pointerEvents: 'none',
          letterSpacing: '0.04em',
        }}>
          ▶ Video
        </span>
      </div>
    ))}
  </div>
);

// Esqueletos de carga adaptados a cada variante
const SkeletonSection = ({ variant, isMobile }) => {
  if (variant === 'hero') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 360 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ borderRadius: 'var(--tt-r-lg)', background: 'var(--tt-paper-2)', animation: 'ttSkeletonPulse 1.6s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, height: 210 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: 'var(--tt-r-lg)', background: 'var(--tt-paper-2)', animation: 'ttSkeletonPulse 1.6s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }
  if (variant === 'list' || variant === 'compact') {
    return <div style={{ display: 'flex', flexDirection: 'column' }}>{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>;
  }
  const cols = (variant === 'grid2' || variant === 'video') ? 2 : isMobile ? 1 : 3;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 28 }}>
      {Array.from({ length: cols }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
};

// Selecciona el componente de layout según la variante
const SeccionLayout = ({ variant, posts, isMobile }) => {
  switch (variant) {
    case 'hero':    return <HeroMosaic stories={posts} />;
    case 'list':    return <LayoutList posts={posts} />;
    case 'compact': return <LayoutCompact posts={posts} />;
    case 'video':   return <LayoutVideo posts={posts} isMobile={isMobile} />;
    case 'grid2':   return <LayoutGrid2 posts={posts} isMobile={isMobile} />;
    case 'grid':
    default:        return <LayoutGrid posts={posts} isMobile={isMobile} />;
  }
};

/**
 * SeccionNoticias — bloque reutilizable de noticias por categoría.
 *
 * Modos de uso:
 *   1. Con datos pre-fetcheados (desde /api/home):
 *      <SeccionNoticias titulo="Sucesos" posts={data.sucesos} loading={loading} variant="grid" />
 *
 *   2. Con fetch automático vía hook:
 *      <SeccionNoticias titulo="Sucesos" categoria="sucesos" limit={6} variant="grid" />
 *
 * Props:
 *   categoria  — slug de WP (ej: 'sucesos'). Solo si no se pasa `posts`.
 *   posts      — array de notas ya fetcheadas. Omite el hook si se pasa.
 *   loading    — estado de carga del padre; muestra skeleton mientras sea true.
 *   titulo     — encabezado visible (ej: 'Sucesos')
 *   italic     — subtítulo en itálica del SectionHead (ej: 'al día')
 *   limit      — notas a cargar cuando se usa el hook (por defecto 6)
 *   variant    — 'grid' | 'grid2' | 'list' | 'compact' | 'video' | 'hero'
 *   isMobile   — adapta el layout al viewport
 *   showHead   — mostrar SectionHead (por defecto true)
 */
const SeccionNoticias = ({
  categoria,
  posts: propPosts,
  loading: externalLoading,
  titulo,
  italic,
  limit = 6,
  variant = 'grid',
  isMobile = false,
  showHead = true,
}) => {
  // Solo activar el hook si no vienen posts por prop
  const { posts: fetchedPosts, loading: hookLoading } = useNotasByCategory(
    propPosts !== undefined ? null : categoria,
    limit,
  );

  const posts = propPosts !== undefined ? propPosts : fetchedPosts;
  // Si el padre nos pasa su propio loading, lo usamos (evita mostrar "vacío" antes de tiempo)
  const loading = propPosts !== undefined ? (externalLoading ?? false) : hookLoading;

  // Las categorías de curaduría interna no tienen página pública
  const publicSlug = (categoria && !HIDDEN_CAT_SLUGS.has(categoria)) ? categoria : null;

  return (
    <div>
      {showHead && titulo && (
        <SectionHead
          title={titulo}
          italic={italic}
          categorySlug={publicSlug}
          verTodas={!!publicSlug}
        />
      )}

      {loading ? (
        <SkeletonSection variant={variant} isMobile={isMobile} />
      ) : posts.length === 0 ? (
        <EmptyState titulo={titulo || categoria} />
      ) : (
        <SeccionLayout variant={variant} posts={posts} isMobile={isMobile} />
      )}
    </div>
  );
};

export default SeccionNoticias;
