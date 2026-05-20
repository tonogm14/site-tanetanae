require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { cacheMiddleware } = require('./src/middleware/cache');

const app = express();
const PORT = process.env.PORT || 3001;
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

// Categorías de curaduría editorial interna.
// No se exponen como badges ni en la navegación del frontend.
// Los slugs reflejan los que existen realmente en WordPress.
const HIDDEN_CAT_SLUGS = new Set([
  'noticias-recientes',  // slug real de la categoría que el equipo llama "recientes"
  'recientes-b',
  'recientes-c',
  'centrales',
  'central-2',
  'mas-noticias',        // aún no creada en WP — se activará cuando exista
  'fueron-noticias',     // aún no creada en WP — se activará cuando exista
  'notificaciones',
  'sin-categoria',
]);

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ────────────────────────────────────────────────
app.use('/posts', require('./src/routes/posts'));
app.use('/categories', require('./src/routes/categories'));
app.use('/search', require('./src/routes/search'));

// ── Category ID cache (warmed at startup) ─────────────────
const catIdCache = new Map();

async function warmCategoryCache() {
  try {
    const { data } = await axios.get(`${WP_API}/categories`, {
      params: { per_page: 100, hide_empty: true },
      timeout: 12000,
    });
    data.forEach(c => catIdCache.set(c.slug, { id: c.id, name: c.name, count: c.count }));
    console.log(`Category cache warmed: ${catIdCache.size} categories`);
  } catch (e) {
    console.warn('Category cache warm failed:', e.message);
  }
}

async function getCategoryId(slug) {
  if (catIdCache.has(slug)) return catIdCache.get(slug).id;
  try {
    const { data } = await axios.get(`${WP_API}/categories`, {
      params: { slug, per_page: 1 },
      timeout: 8000,
    });
    if (data[0]?.id) catIdCache.set(slug, { id: data[0].id, name: data[0].name });
    return data[0]?.id || null;
  } catch {
    return null;
  }
}

// ── Shared mapPost ────────────────────────────────────────
function mapPost(post) {
  const embedded = post._embedded || {};
  const featuredMedia = embedded['wp:featuredmedia']?.[0];
  const author = embedded['author']?.[0];
  const terms = embedded['wp:term'] || [];
  const allCats = terms[0] || [];

  // Seleccionar categoría de visualización: omitir las de curaduría interna
  const displayCat = allCats.find(c => !HIDDEN_CAT_SLUGS.has(c.slug));
  const catSlug = displayCat?.slug || null;
  const catName = displayCat
    ? (catIdCache.get(displayCat.slug)?.name || displayCat.name)
    : 'Delta Amacuro';
  // Tono de color para placeholder (puede usar slug interno, solo es visual)
  const imgTone = displayCat?.slug || allCats[0]?.slug || 'recientes';

  const imgUrl = featuredMedia?.source_url || null;
  const imgSizes = featuredMedia?.media_details?.sizes || {};
  const imgMedium = imgSizes.medium_large?.source_url || imgSizes.large?.source_url || imgUrl;

  const dateObj = new Date(post.date);
  const dateStr = dateObj.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });

  const wordCount = (post.content?.rendered || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;

  const excerpt = (post.excerpt?.rendered || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[&hellip;\]/g, '…')
    .trim();

  const title = (post.title?.rendered || '')
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…').replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '');

  return {
    id: String(post.id),
    slug: post.slug,
    cat: catName,
    catSlug,
    kicker: catName,
    title,
    excerpt,
    deck: excerpt,
    img: imgTone,
    imgUrl: imgMedium || imgUrl,
    imgFull: imgUrl,
    author: author?.name || 'Tane Tanae',
    authorRole: author?.description || '',
    date: dateStr,
    time: dateObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
    readTime,
    link: post.link,
    content: post.content?.rendered || '',
    tags: (embedded['wp:term']?.[1] || []).map(t => t.name),
  };
}

// ── Fetch helpers ─────────────────────────────────────────
async function fetchSection({ perPage = 4, categorySlug, orderby = 'date' } = {}) {
  try {
    const params = {
      per_page: perPage,
      _embed: 1,
      status: 'publish',
      orderby,
      order: 'desc',
      _fields: 'id,slug,title,excerpt,date,link,_links,_embedded',
    };
    if (categorySlug) {
      const id = await getCategoryId(categorySlug);
      // Si la categoría no existe en WP → sección vacía (no mostrar posts sin filtrar)
      if (!id) return [];
      params.categories = id;
    }
    const { data } = await axios.get(`${WP_API}/posts`, { params, timeout: 15000 });
    return data.map(mapPost);
  } catch {
    return [];
  }
}

async function fetchBreakingTitles() {
  try {
    const catId = catIdCache.get('ultima-hora')?.id || await getCategoryId('ultima-hora');
    const params = { per_page: 5, status: 'publish', orderby: 'date', order: 'desc', _fields: 'id,slug,title' };
    if (catId) params.categories = catId;
    const { data } = await axios.get(`${WP_API}/posts`, { params, timeout: 10000 });
    const toObj = p => ({ title: (p.title?.rendered || '').replace(/<[^>]+>/g, ''), slug: p.slug || null });
    if (!data.length) {
      const { data: recent } = await axios.get(`${WP_API}/posts`, {
        params: { per_page: 5, status: 'publish', _fields: 'id,slug,title' },
        timeout: 10000,
      });
      return recent.map(toObj);
    }
    return data.map(toObj);
  } catch {
    return [];
  }
}

// ── GET /home — todos los bloques del home en UN solo request ──
// Fetch paralelo de todas las secciones; caché de 10 minutos.
app.get('/home', cacheMiddleware(600), async (req, res) => {
  // Pre-resolver todos los IDs de categoría (rápido desde caché tras warm-up)
  const allSlugs = [
    'noticias-recientes', 'recientes-b', 'recientes-c', 'centrales', 'central-2',
    'sucesos', 'deportes', 'indigenas', 'trinidad-y-tobago', 'videos',
    'notificaciones',
  ];
  await Promise.all(allSlugs.map(slug => getCategoryId(slug)));

  // Fetch centrales una sola vez y dividir por posición:
  // - masNoticias    = posts 1, 2, 3  (los 3 más recientes de centrales)
  // - fueronNoticias = posts 4 en adelante (los que "bajaron" del bloque principal)
  const [breaking, hero, centralesAll, sucesos, deportes, indigena, trinidad, video, mostRead, guyana] = await Promise.allSettled([
    fetchBreakingTitles(),
    fetchSection({ perPage: 5,  categorySlug: 'noticias-recientes' }),
    fetchSection({ perPage: 15, categorySlug: 'centrales' }),
    fetchSection({ perPage: 5,  categorySlug: 'sucesos' }),
    fetchSection({ perPage: 5,  categorySlug: 'deportes' }),
    fetchSection({ perPage: 4,  categorySlug: 'indigenas' }),
    fetchSection({ perPage: 4,  categorySlug: 'trinidad-y-tobago' }),
    fetchSection({ perPage: 4,  categorySlug: 'videos' }),
    fetchSection({ perPage: 5,  orderby: 'comment_count' }),
    fetchSection({ perPage: 4,  categorySlug: 'guyana' }),
  ]);

  const ok = r => r.status === 'fulfilled' ? r.value : [];
  const allCentrales = ok(centralesAll);

  // Exponer solo categorías de contenido público (excluir las de curaduría)
  const categories = Array.from(catIdCache.entries())
    .filter(([slug]) => !HIDDEN_CAT_SLUGS.has(slug))
    .map(([slug, info]) => ({
      slug,
      name: info.name || (slug.charAt(0).toUpperCase() + slug.slice(1)),
      count: info.count || 0,
      color: `var(--tt-img--${slug})`,
    }));

  res.json({
    breaking:       ok(breaking),
    hero:           ok(hero),
    centrales:      allCentrales.slice(0, 3),   // los 3 más recientes
    masNoticias:    allCentrales.slice(0, 3),   // misma data, display compacto en sidebar
    fueronNoticias: allCentrales.slice(3),      // del 4to en adelante
    sucesos:        ok(sucesos),
    deportes:       ok(deportes),
    indigena:       ok(indigena),
    trinidad:       ok(trinidad),
    guyana:         ok(guyana),
    video:          ok(video),
    mostRead:       ok(mostRead),
    categories,
  });
});

// ── GET /breaking ─────────────────────────────────────────
app.get('/breaking', cacheMiddleware(60), async (req, res) => {
  const items = await fetchBreakingTitles();
  res.json({ items });
});

// ── GET /hero ─────────────────────────────────────────────
app.get('/hero', cacheMiddleware(120), async (req, res) => {
  const posts = await fetchSection({ perPage: 5, categorySlug: 'noticias-recientes' });
  res.json(posts);
});

// ── GET /most-read ────────────────────────────────────────
app.get('/most-read', cacheMiddleware(300), async (req, res) => {
  const posts = await fetchSection({ perPage: 5, orderby: 'comment_count' });
  res.json(posts);
});

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    wp_api: WP_API,
    categories_cached: catIdCache.size,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 / error handlers ──────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`Tane Tanae API → http://localhost:${PORT}`);
  console.log(`WordPress API  → ${WP_API}`);
  warmCategoryCache().catch(() => {});
});
