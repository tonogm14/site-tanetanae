require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { cache, cacheMiddleware, registerRevalidator, setCache, deleteCache } = require('./src/middleware/cache');
const { initSchema, upsertPosts, getFallbackPosts, incrementOfflineViews, drainOfflineViews, getPostCount } = require('./src/db');

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

// ── Orígenes permitidos ───────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://tanetanae.com',
  'https://www.tanetanae.com',
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(s => s.trim()) : []),
]);

// ── Confiar en proxy de Railway / ngrok para IPs reales ──
app.set('trust proxy', 1);

// ── CORS restrictivo ──────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Sin origin = request server-side o herramientas como curl (solo en dev)
    if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    cb(Object.assign(new Error('CORS: origen no autorizado'), { status: 403 }));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── Rate limiter en memoria (sin dependencias) ────────────
// Usa ip + postId para que cada artículo tenga su propio cupo.
const viewsRateMap = new Map(); // key: `${ip}:${id}` → { count, resetAt }
const VIEWS_WINDOW_MS  = 60 * 60 * 1000; // 1 hora
const VIEWS_MAX        = 3;               // máx 3 veces por IP/artículo por hora

function viewsRateLimit(req, res, next) {
  const ip  = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `${ip}:${req.params.id}`;
  const now = Date.now();
  const entry = viewsRateMap.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= VIEWS_MAX) {
      return res.status(429).json({ error: 'Too many requests', views: 0 });
    }
    entry.count++;
  } else {
    viewsRateMap.set(key, { count: 1, resetAt: now + VIEWS_WINDOW_MS });
  }

  // Limpiar entradas expiradas cada ~500 requests para no crecer sin límite
  if (viewsRateMap.size > 500) {
    for (const [k, v] of viewsRateMap) {
      if (now >= v.resetAt) viewsRateMap.delete(k);
    }
  }
  next();
}

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
app.use('/authors', require('./src/routes/authors'));
app.use('/banners', require('./src/routes/banners'));
app.use('/comments', require('./src/routes/comments'));
app.use('/recent', require('./src/routes/recent'));

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
    commentStatus: post.comment_status || 'closed',
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

  const result = {
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

  // Guardar en DB en background si WP respondió con contenido
  const wpPosts = [
    ...result.hero, ...allCentrales, ...result.sucesos,
    ...result.deportes, ...result.indigena, ...result.video,
    ...ok(trinidad), ...ok(guyana),
  ];
  const uniquePosts = [...new Map(wpPosts.map(p => [p.id, p])).values()];
  if (uniquePosts.length > 0) {
    upsertPosts(uniquePosts).catch(e => console.warn('DB upsert bg error:', e.message));
  } else {
    // WP sin contenido — intentar fallback de DB
    console.warn('buildHomeData: WP sin posts, usando fallback de DB');
    const fallback = await getFallbackPosts(50);
    if (fallback.length) {
      return {
        ...result,
        hero:           fallback.slice(0, 5),
        masNoticias:    fallback.slice(5, 8),
        fueronNoticias: fallback.slice(8, 14),
        mostRead:       fallback.slice(0, 5),
      };
    }
  }

  return result;
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

// ── POST /webhook/post — notificación de WP al publicar o actualizar ─────────
// Los webhooks son server→server (no hay browser ni Origin) — CORS no aplica.
// Seguridad: header X-Webhook-Secret o query ?secret debe coincidir con WEBHOOK_SECRET.
app.post('/webhook/post', express.json(), (req, res, next) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return next(); // Si no hay secret configurado, pasar (dev)
  const received = req.headers['x-webhook-secret'] || req.query.secret || '';
  if (received !== secret) return res.status(403).json({ error: 'Forbidden' });
  next();
}, async (req, res) => {
  // WP Webhooks plugin / functions.php pueden enviar distintos campos
  const body   = req.body || {};
  const postId = body.ID || body.id || body.post_id;

  if (!postId) return res.status(400).json({ error: 'post id requerido' });

  try {
    // Obtener el post completo desde WP (con _embed para categorías, imagen, autor)
    const { data } = await axios.get(`${WP_API}/posts/${postId}`, {
      params: { _embed: 1 },
      timeout: 15000,
    });

    if (!data?.id) return res.status(404).json({ error: 'Post no encontrado en WP' });

    const post = mapPost(data);

    // Guardar en DB
    await upsertPosts([post]);

    // Invalidar caché del home para que el siguiente GET traiga datos frescos
    deleteCache('/home');

    console.log(`Webhook: post ${postId} (${post.slug}) guardado y caché invalidado`);
    res.json({ ok: true, id: post.id, slug: post.slug });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(502).json({ error: 'Error al obtener el post de WP', detail: e.message });
  }
});

// ── POST /views/:id — incremento atómico via WordPress ───────────────────────
app.post('/views/:id', viewsRateLimit, async (req, res) => {
  const postId = req.params.id;
  try {
    const { data } = await axios.post(
      `${WP_BASE}/wp-json/tt/v1/view/${postId}`,
      {},
      { timeout: 5000 }
    );
    // WP respondió — sincronizar vistas offline pendientes
    drainOfflineViews(postId).then(async pending => {
      if (pending <= 0) return;
      // Enviar las vistas acumuladas offline como requests adicionales a WP
      const batch = Math.min(pending, 20); // máximo 20 para no saturar WP
      for (let i = 0; i < batch; i++) {
        await axios.post(`${WP_BASE}/wp-json/tt/v1/view/${postId}`, {}, { timeout: 4000 })
          .catch(() => {});
      }
      console.log(`DB: sincronizadas ${batch} vistas offline del post ${postId}`);
    }).catch(() => {});
    res.json(data);
  } catch {
    // WP no disponible — registrar visita en DB y devolver total estimado
    const total = await incrementOfflineViews(postId);
    res.json({ views: total ?? 0 });
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

// ── POST /cache/bust — invalidación inmediata al guardar en WordPress ─────────
// WordPress llama esto desde save_post via wp_remote_post (non-blocking).
// Requiere el mismo WEBHOOK_SECRET que /admin/seed.
app.post('/cache/bust', async (req, res) => {
  const secret   = process.env.WEBHOOK_SECRET;
  const received = req.headers['x-webhook-secret'] || req.body?.secret || '';
  if (secret && received !== secret) return res.status(403).json({ error: 'Forbidden' });

  const { slug } = req.body || {};
  if (!slug) return res.status(400).json({ error: 'slug requerido' });

  const deleted = [];

  // Post individual
  deleteCache(`/posts/slug/${slug}`);
  deleted.push(`/posts/slug/${slug}`);

  // Listas y páginas que podrían incluir este post
  const listPrefixes = ['/posts', '/home', '/hero', '/breaking', '/most-read', '/recent'];
  for (const key of cache.keys()) {
    if (listPrefixes.some(p => key === p || key.startsWith(p + '?'))) {
      deleteCache(key);
      deleted.push(key);
    }
  }

  console.log(`Cache bust: ${deleted.length} keys para slug="${slug}"`);
  res.json({ ok: true, deleted: deleted.length, slug });
});

// ── Health check ──────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const dbUrl    = process.env.DATABASE_URL;
  const dbActive = !!dbUrl;
  const dbCount  = dbActive ? await getPostCount().catch(() => -1) : null;
  res.json({
    status: 'ok',
    wp_api: WP_API,
    categories_cached: catIdCache.size,
    db: {
      configured: dbActive,
      posts_cached: dbCount,
      url_prefix: dbUrl ? dbUrl.slice(0, 30) + '…' : null,
    },
    timestamp: new Date().toISOString(),
  });
});

// ── POST /admin/seed — fuerza seed manual (requiere WEBHOOK_SECRET) ──────────
app.post('/admin/seed', async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  const received = req.headers['x-webhook-secret'] || req.query.secret || '';
  if (secret && received !== secret) return res.status(403).json({ error: 'Forbidden' });

  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'DATABASE_URL no configurado' });

  try {
    const before = await getPostCount();
    const { data } = await axios.get(`${WP_API}/posts`, {
      params: { per_page: 100, _embed: 1, status: 'publish', orderby: 'date', order: 'desc' },
      timeout: 30000,
    });
    const posts = data.map(mapPost);
    await upsertPosts(posts);
    const after = await getPostCount();
    deleteCache('/home');
    res.json({ ok: true, fetched: posts.length, before, after });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ── 404 / error handlers ──────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Seed DB — rellena hasta 100 notas al arrancar si la DB tiene pocas ───────
async function seedDatabase() {
  if (!process.env.DATABASE_URL) return;
  try {
    const count = await getPostCount();
    if (count >= 50) {
      console.log(`DB seed: ya hay ${count} notas, omitiendo`);
      return;
    }
    console.log(`DB seed: ${count} notas en DB, obteniendo 100 de WP...`);
    const { data } = await axios.get(`${WP_API}/posts`, {
      params: {
        per_page: 100,
        _embed: 1,
        status: 'publish',
        orderby: 'date',
        order: 'desc',
      },
      timeout: 30000,
    });
    const posts = data.map(mapPost);
    await upsertPosts(posts);
    console.log(`DB seed: ${posts.length} notas guardadas`);
  } catch (e) {
    console.warn('DB seed falló:', e.message);
  }
}

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`Tane Tanae API → http://localhost:${PORT}`);
  console.log(`WordPress API  → ${WP_API}`);

  // Inicializar esquema de DB, calentar caché y sembrar notas
  initSchema()
    .then(() => warmCategoryCache())
    .then(() => Promise.all([
      buildHomeData().then(data => { setCache('/home', data, 900); console.log('Cache pre-warmed: /home listo'); }),
      seedDatabase(),
    ]))
    .catch(e => console.warn('Pre-warm falló:', e.message));
});
