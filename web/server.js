/**
 * Servidor web de producción — inyecta og:image y meta tags de artículo
 * en el HTML antes de responderle al cliente (bots de redes sociales incluidos).
 *
 * Env vars:
 *   PORT          Puerto donde escucha (Railway lo inyecta automáticamente)
 *   API_URL       URL interna del API Express. Ej: http://api.railway.internal:3002
 *   WP_BASE       URL base de WordPress. Ej: https://cms.tanetanae.com
 *                 Fallback: https://tanetanae.com (mismo dominio anterior de WP)
 *   VITE_SITE_URL URL pública del sitio. Ej: https://www.tanetanae.com
 */

import express    from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath }  from 'url';
import { get as httpGet }  from 'http';
import { get as httpsGet } from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST      = join(__dirname, 'dist');
const PORT      = parseInt(process.env.PORT || '3000', 10);
const API_URL   = (process.env.API_URL || 'http://localhost:3002').replace(/\/$/, '');
const WP_BASE   = (process.env.WP_BASE  || 'https://tanetanae.com').replace(/\/$/, '');
const SITE_URL  = (process.env.VITE_SITE_URL || 'https://www.tanetanae.com').replace(/\/$/, '');

// index.html compilado — se lee una sola vez al arrancar
const INDEX_HTML = readFileSync(join(DIST, 'index.html'), 'utf-8');

// Rutas SPA que NO son slugs de artículo — no hacer fetch a la API
const SPA_PREFIXES = new Set(['categoria', 'author', 'tag', 'buscar', 'recientes', 'tendencias', 'videos', 'api']);

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

// ── Bots conocidos de scraping que ignoramos / bloqueamos ────────────────────
// No incluye bots legítimos (Googlebot, Bingbot, etc.)
const BLOCKED_UA = /AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|Bytespider|PetalBot|Scrapy|python-requests|Go-http-client|curl\/|wget\/|HTTrack|WebCopier|SiteSnagger|TeleportPro|Offline Explorer|BlackWidow|Zeus|EmailCollector|EmailSiphon|EmailWolf|ExtractorPro|CopyRightCheck|Mogimogi|Heritrix|larbin|ZmEu|sqlmap|libwww-perl/i;

// ── Rate limiter simple en memoria: N requests por IP en ventana de tiempo ───
const rateMap  = new Map();
const RATE_WIN = 60_000;  // 1 minuto
const RATE_MAX = 80;      // máximo requests por IP/minuto (permite uso legítimo)

function rateLimit(req, res, next) {
  // Saltar archivos estáticos con extensión (.js, .css, .png …)
  if (extname(req.path)) return next();

  const ip  = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = rateMap.get(ip);

  if (rec && now < rec.resetAt) {
    if (rec.count >= RATE_MAX) {
      res.set('Retry-After', '60');
      return res.status(429).send('Too Many Requests');
    }
    rec.count++;
  } else {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WIN });
  }

  // Limpiar entradas expiradas periódicamente
  if (rateMap.size > 2000) {
    for (const [k, v] of rateMap) { if (now >= v.resetAt) rateMap.delete(k); }
  }
  next();
}

function injectMeta(post, slug) {
  const title   = `${post.title} · Tane Tanae`;
  const desc    = post.excerpt || post.deck || 'La voz del Delta. Periodismo independiente desde Tucupita, Delta Amacuro.';
  const imgUrl  = post.imgUrl || '';
  const pageUrl = `${SITE_URL}/${slug}`;

  let html = INDEX_HTML;

  // Canonical URL — le dice a Google quién publicó primero
  html = html.replace('</head>',
    `    <link rel="canonical" href="${esc(pageUrl)}" />\n  </head>`
  );

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(property="og:title"\s+content=")[^"]*"/,       `$1${esc(title)}"`);
  html = html.replace(/(property="og:description"\s+content=")[^"]*"/, `$1${esc(desc)}"`);
  html = html.replace(/(property="og:url"\s+content=")[^"]*"/,         `$1${esc(pageUrl)}"`);
  html = html.replace(/(property="og:type"\s+content=")[^"]*"/,        `$1article"`);
  html = html.replace(/(name="twitter:title"\s+content=")[^"]*"/,      `$1${esc(title)}"`);
  html = html.replace(/(name="twitter:description"\s+content=")[^"]*"/, `$1${esc(desc)}"`);

  if (imgUrl) {
    html = html.replace(/(name="twitter:card"\s+content=")[^"]*"/, `$1summary_large_image"`);
    html = html.replace('</head>',
      `    <meta property="og:image" content="${esc(imgUrl)}" />\n` +
      `    <meta property="og:image:width" content="1200" />\n` +
      `    <meta property="og:image:height" content="630" />\n` +
      `    <meta name="twitter:image" content="${esc(imgUrl)}" />\n` +
      `  </head>`
    );
  }

  return html;
}

function httpGet1(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? httpsGet : httpGet;
    try {
      const req = lib(url, { timeout: timeoutMs }, res => {
        if (res.statusCode !== 200) return resolve(null);
        let body = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
      });
      req.on('error',   () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

// Extrae datos de post directamente del WordPress REST API.
// Fallback para cuando API_URL interno no está configurado.
function mapWpPost(wp) {
  if (!wp) return null;
  const embedded   = wp._embedded || {};
  const media      = embedded['wp:featuredmedia']?.[0];
  const author     = embedded['author']?.[0];
  const imgUrl     = media?.media_details?.sizes?.large?.source_url
                  || media?.media_details?.sizes?.medium_large?.source_url
                  || media?.source_url
                  || null;
  const excerpt = (wp.excerpt?.rendered || '')
    .replace(/<[^>]+>/g, '').replace(/\[&hellip;\]/g, '…').trim();
  return {
    title:  (wp.title?.rendered || '').replace(/<[^>]+>/g, ''),
    excerpt,
    deck:   excerpt,
    imgUrl,
    author: author?.name || 'Tane Tanae',
  };
}

async function fetchPost(slug) {
  // 1. Intentar API interna (más rápida, datos ya mapeados)
  const fromApi = await httpGet1(`${API_URL}/posts/slug/${encodeURIComponent(slug)}`, 4000);
  if (fromApi?.title) return fromApi;

  // 2. Fallback: WordPress REST API directo
  const WP_API = `${WP_BASE}/wp-json/wp/v2`;
  const wpArr  = await httpGet1(
    `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=1&per_page=1`,
    8000,
  );
  if (Array.isArray(wpArr) && wpArr.length) return mapWpPost(wpArr[0]);

  return null;
}

const app = express();

// Bloquear bots de scraping conocidos (antes de cualquier otra ruta)
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (BLOCKED_UA.test(ua)) return res.status(403).end();
  next();
});

// Rate limiting global (excluye archivos estáticos)
app.use(rateLimit);

// Headers de seguridad aplicados a todas las respuestas HTML
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

// Archivos estáticos del build (JS, CSS, imágenes, fuentes…)
app.use(express.static(DIST, { index: false }));

// Health check — Railway lo usa para saber que el servidor está listo
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Obtiene un XML directamente de WordPress y reescribe las URLs de origen
// (WP_BASE) a las del sitio público (SITE_URL) para que Google vea el dominio correcto.
function fetchWpXml(wpPath) {
  return new Promise((resolve, reject) => {
    const url = `${WP_BASE}${wpPath}`;
    const lib = url.startsWith('https') ? httpsGet : httpGet;
    const r = lib(url, { timeout: 12000 }, resp => {
      let b = '';
      resp.setEncoding('utf-8');
      resp.on('data', d => b += d);
      resp.on('end', () => resolve({ status: resp.statusCode, body: b }));
    });
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
  });
}

function rewriteXmlUrls(xml) {
  // Quita el stylesheet XSL de Yoast (apunta a cms.tanetanae.com → CORS al proxy)
  // Google no lo necesita; el browser muestra el árbol XML nativo sin él.
  return xml
    .replace(/<\?xml-stylesheet[^?]*\?>\n?/g, '')
    .replaceAll(WP_BASE, SITE_URL);
}

const XML_EMPTY = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';

// /sitemap.xml — primero intenta el archivo generado en build, luego WP directo
app.get('/sitemap.xml', async (_req, res) => {
  const staticPath = join(DIST, 'sitemap.xml');
  if (existsSync(staticPath)) {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    return res.send(readFileSync(staticPath, 'utf-8'));
  }
  try {
    const { body } = await fetchWpXml('/sitemap_index.xml');
    res.set('Content-Type', 'application/xml; charset=utf-8').send(rewriteXmlUrls(body));
  } catch {
    res.status(503).set('Content-Type', 'application/xml').send(XML_EMPTY);
  }
});

// /sitemap_index.xml, /post-sitemap.xml, /post-sitemap2.xml, /category-sitemap.xml …
app.get(/^\/[\w][\w-]*\.xml$/, async (req, res) => {
  try {
    const { status, body } = await fetchWpXml(req.path);
    res.status(status).set('Content-Type', 'application/xml; charset=utf-8').send(rewriteXmlUrls(body));
  } catch {
    res.status(503).set('Content-Type', 'application/xml').send(XML_EMPTY);
  }
});

// ── llms.txt — índice de contenido para asistentes de IA ─────────────────────
// Especificación: https://llmstxt.org
// Se genera dinámicamente con los posts más recientes de la API.

const SECTIONS = [
  { slug: 'sucesos',           name: 'Sucesos',           desc: 'Noticias de seguridad, accidentes y eventos locales en Delta Amacuro' },
  { slug: 'deportes',          name: 'Deportes',           desc: 'Noticias deportivas del estado Delta Amacuro' },
  { slug: 'indigenas',         name: 'Indígena',           desc: 'Noticias sobre las comunidades warao y pueblos originarios del Delta' },
  { slug: 'trinidad-y-tobago', name: 'Trinidad y Tobago',  desc: 'Noticias sobre la relación binacional con Trinidad y Tobago' },
  { slug: 'guyana',            name: 'Guyana',             desc: 'Noticias sobre Guyana y el territorio Esequibo' },
  { slug: 'videos',            name: 'Videos',             desc: 'Cobertura en video de eventos y noticias locales' },
  { slug: 'opinion',           name: 'Opinión',            desc: 'Columnas de opinión y análisis del Delta Amacuro' },
  { slug: 'especiales',        name: 'Especiales',         desc: 'Reportajes especiales e investigaciones periodísticas' },
];

let llmsCache = { body: null, builtAt: 0 };
const LLMS_TTL = 6 * 60 * 60 * 1000; // 6 horas

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? httpsGet : httpGet;
    const r = lib(url, { timeout: 8000 }, resp => {
      let b = '';
      resp.setEncoding('utf-8');
      resp.on('data', d => b += d);
      resp.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } });
    });
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
  });
}

async function buildLlmsTxt(full = false) {
  const perPage = full ? 100 : 20;
  let posts = [];
  try {
    const data = await fetchJson(`${API_URL}/posts?per_page=${perPage}&page=1`);
    posts = data?.posts || [];
  } catch { /* sin posts recientes */ }

  const lines = [
    `# Tane Tanae`,
    ``,
    `> La voz del Delta. Periodismo independiente desde Tucupita, Delta Amacuro, Venezuela.`,
    ``,
    `Tane Tanae es el medio de comunicación digital independiente de Delta Amacuro, Venezuela. Cubrimos noticias locales, sucesos, deportes, comunidades indígenas warao y la relación de la región con Trinidad y Tobago y Guyana.`,
    ``,
    `## Secciones principales`,
    ``,
    `- [Inicio](${SITE_URL}/): Portada con las últimas noticias del Delta Amacuro`,
    ...SECTIONS.map(s => `- [${s.name}](${SITE_URL}/categoria/${s.slug}): ${s.desc}`),
    ``,
    `## Artículos ${full ? '' : 'recientes '}(${posts.length})`,
    ``,
  ];

  for (const p of posts) {
    const excerpt = (p.excerpt || p.deck || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const url = `${SITE_URL}/${p.slug}`;
    lines.push(`- [${p.title}](${url})${excerpt ? `: ${excerpt}` : ''}`);
  }

  if (full) {
    lines.push(``, `## Más información`, ``);
    lines.push(`- [llms.txt](${SITE_URL}/llms.txt): Versión compacta (20 artículos)`);
    lines.push(`- [Sitemap](${SITE_URL}/sitemap_index.xml): Índice completo de URLs`);
  } else {
    lines.push(``, `## Ver más`, ``);
    lines.push(`- [llms-full.txt](${SITE_URL}/llms-full.txt): Índice extendido (100 artículos más recientes)`);
    lines.push(`- [Sitemap](${SITE_URL}/sitemap_index.xml): Índice completo de URLs`);
  }

  return lines.join('\n');
}

app.get('/llms.txt', async (_req, res) => {
  const now = Date.now();
  if (!llmsCache.body || now - llmsCache.builtAt > LLMS_TTL) {
    llmsCache.body = await buildLlmsTxt(false).catch(() => null);
    llmsCache.builtAt = now;
  }
  res.set('Content-Type', 'text/plain; charset=utf-8')
     .set('Cache-Control', 'public, max-age=21600')
     .send(llmsCache.body || '# Tane Tanae\n\n> La voz del Delta.');
});

app.get('/llms-full.txt', async (_req, res) => {
  const body = await buildLlmsTxt(true).catch(() => null);
  res.set('Content-Type', 'text/plain; charset=utf-8')
     .set('Cache-Control', 'public, max-age=21600')
     .send(body || '# Tane Tanae\n\n> La voz del Delta.');
});

// Rutas con extensión de archivo (.xml, .json, .txt) que no existen en dist/
// → 404, no index.html (evita que Google indexe URLs no válidas)
app.get('*', (req, res, next) => {
  const ext = extname(req.path);
  if (ext && ext !== '.html') return res.status(404).end();
  next();
});

// Todas las rutas → SPA, con inyección de meta para slugs de artículo
app.get('*', async (req, res) => {
  // Detectar slug de artículo: /alguna-noticia (sin sub-rutas)
  const m = req.path.match(/^\/([a-z0-9][a-z0-9-]*[a-z0-9])(?:\/?)?$/);
  const slug = m?.[1];

  if (slug && !SPA_PREFIXES.has(slug)) {
    try {
      const post = await fetchPost(slug);
      if (post?.title) return res.send(injectMeta(post, slug));
    } catch { /* sirve index.html genérico */ }
  }

  res.send(INDEX_HTML);
});

app.listen(PORT, () => console.log(`Web: puerto ${PORT}`));
