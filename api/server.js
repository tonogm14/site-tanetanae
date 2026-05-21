require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { cacheMiddleware, registerRevalidator, setCache } = require('./src/middleware/cache');

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
app.use('/tags', require('./src/routes/tags'));
app.use('/banners', require('./src/routes/banners'));

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
  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dateStr = `${dateObj.getDate()} ${MONTHS_ES[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;

  const wordCount = (post.content?.rendered || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(4, Math.round(wordCount / 200))} min`;

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
async function fetchSection({ perPage = 4, categorySlug, orderby = 'date', after } = {}) {
  try {
    const params = {
      per_page: perPage,
      _embed: 1,
      status: 'publish',
      orderby,
      order: 'desc',
      _fields: 'id,slug,title,excerpt,date,link,_links,_embedded',
    };
    if (after) params.after = after;
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

// ── buildHomeData — lógica extraída para poder reutilizarla en pre-warm y SWR ──
async function buildHomeData() {
  const allSlugs = [
    'noticias-recientes', 'recientes-b', 'recientes-c', 'centrales', 'central-2',
    'sucesos', 'deportes', 'indigenas', 'trinidad-y-tobago', 'videos', 'notificaciones',
  ];
  await Promise.all(allSlugs.map(slug => getCategoryId(slug)));

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

  const categories = Array.from(catIdCache.entries())
    .filter(([slug]) => !HIDDEN_CAT_SLUGS.has(slug))
    .map(([slug, info]) => ({
      slug,
      name: info.name || (slug.charAt(0).toUpperCase() + slug.slice(1)),
      count: info.count || 0,
      color: `var(--tt-img--${slug})`,
    }));

  return {
    breaking:       ok(breaking),
    hero:           ok(hero),
    centrales:      allCentrales.slice(0, 3),
    masNoticias:    allCentrales.slice(0, 3),
    fueronNoticias: allCentrales.slice(3),
    sucesos:        ok(sucesos),
    deportes:       ok(deportes),
    indigena:       ok(indigena),
    trinidad:       ok(trinidad),
    guyana:         ok(guyana),
    video:          ok(video),
    mostRead:       ok(mostRead),
    categories,
  };
}

// Registrar revalidador para stale-while-revalidate
registerRevalidator('/home', buildHomeData);

// ── GET /home — todos los bloques del home en UN solo request ──
app.get('/home', cacheMiddleware(900), async (req, res) => {
  const data = await buildHomeData();
  res.json(data);
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

// ── GET /most-read — noticias aleatorias del día ─────────
app.get('/most-read', cacheMiddleware(300), async (req, res) => {
  // Busca posts de hoy; si hay menos de 5, amplía a los últimos 3 días
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  let posts = await fetchSection({ perPage: 20, after: todayMidnight.toISOString() });
  if (posts.length < 5) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    posts = await fetchSection({ perPage: 20, after: threeDaysAgo.toISOString() });
  }

  // Mezcla aleatoria (Fisher-Yates) y devuelve 5
  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]];
  }
  res.json(posts.slice(0, 5));
});

// ── POST /views/:id — incremento atómico via WordPress ───────────────────────
// El frontend llama esto fire-and-forget al cargar un artículo.
// No se cachea — cada visita debe llegar a WordPress.
app.post('/views/:id', async (req, res) => {
  try {
    const { data } = await axios.post(
      `${WP_BASE}/wp-json/tt/v1/view/${req.params.id}`,
      {},
      { timeout: 5000 }
    );
    res.json(data);
  } catch {
    // Si WordPress falla, responder OK de todas formas — no es crítico
    res.json({ views: 0 });
  }
});

// ── Sitemap proxy — forwards Yoast WP sitemaps (auto-updates with every new post) ──
// WP_BASE: where WordPress lives after the domain moves to Railway (e.g. cms.tanetanae.com)
// SITE_URL: the public domain of the new site (used to rewrite <loc> URLs in the sitemap)
const WP_BASE  = (process.env.WP_BASE  || 'https://www.tanetanae.com').replace(/\/$/, '');
const SITE_URL = (process.env.SITE_URL || 'https://www.tanetanae.com').replace(/\/$/, '');

function proxySitemap(xml) {
  // Replace every occurrence of the WP origin with the public site URL
  // so Google sees tanetanae.com/slug instead of cms.tanetanae.com/slug
  return xml.replaceAll(WP_BASE, SITE_URL);
}

app.get('/sitemap_index.xml', cacheMiddleware(3600), async (_req, res) => {
  try {
    const { data } = await axios.get(`${WP_BASE}/sitemap_index.xml`, { timeout: 12000 });
    res.set('Content-Type', 'application/xml');
    res.send(proxySitemap(data));
  } catch {
    res.status(502).send('<!-- sitemap unavailable -->');
  }
});

// Matches /post-sitemap.xml, /post-sitemap2.xml, /category-sitemap.xml, /author-sitemap.xml, etc.
app.get('/:name(\\w[\\w-]*\\.xml)', cacheMiddleware(3600), async (req, res) => {
  try {
    const { data } = await axios.get(`${WP_BASE}/${req.params.name}`, { timeout: 12000 });
    res.set('Content-Type', 'application/xml');
    res.send(proxySitemap(data));
  } catch {
    res.status(404).send('<!-- not found -->');
  }
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

  // Pre-calentar caché al arrancar: el primer usuario recibe respuesta instantánea
  warmCategoryCache()
    .then(() => buildHomeData())
    .then(data => {
      setCache('/home', data, 900);
      console.log('Cache pre-warmed: /home listo');
    })
    .catch(e => console.warn('Pre-warm falló:', e.message));
});
