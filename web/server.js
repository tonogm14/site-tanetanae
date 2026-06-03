/**
 * Servidor web de producción — inyecta og:image y meta tags de artículo
 * en el HTML antes de responderle al cliente (bots de redes sociales incluidos).
 *
 * Env vars:
 *   PORT          Puerto donde escucha (Railway lo inyecta automáticamente)
 *   API_URL       URL interna del API Express. Ej: http://api.railway.internal:3002
 *                 Fallback: http://localhost:3002
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
const SITE_URL  = (process.env.VITE_SITE_URL || 'https://www.tanetanae.com').replace(/\/$/, '');

// index.html compilado — se lee una sola vez al arrancar
const INDEX_HTML = readFileSync(join(DIST, 'index.html'), 'utf-8');

// Rutas SPA que NO son slugs de artículo — no hacer fetch a la API
const SPA_PREFIXES = new Set(['categoria', 'buscar', 'recientes', 'tendencias', 'videos', 'api']);

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function injectMeta(post, slug) {
  const title   = `${post.title} · Tane Tanae`;
  const desc    = post.excerpt || post.deck || 'La voz del Delta. Periodismo independiente desde Tucupita, Delta Amacuro.';
  const imgUrl  = post.imgUrl || '';
  const pageUrl = `${SITE_URL}/${slug}`;

  let html = INDEX_HTML;

  // Reemplaza tags existentes en el template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(property="og:title"\s+content=")[^"]*"/,       `$1${esc(title)}"`);
  html = html.replace(/(property="og:description"\s+content=")[^"]*"/, `$1${esc(desc)}"`);
  html = html.replace(/(property="og:url"\s+content=")[^"]*"/,         `$1${esc(pageUrl)}"`);
  html = html.replace(/(property="og:type"\s+content=")[^"]*"/,        `$1article"`);
  html = html.replace(/(name="twitter:title"\s+content=")[^"]*"/,      `$1${esc(title)}"`);
  html = html.replace(/(name="twitter:description"\s+content=")[^"]*"/, `$1${esc(desc)}"`);

  // Agrega og:image / twitter:image (no están en el template base)
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

function fetchPost(slug) {
  return new Promise(resolve => {
    const url = `${API_URL}/posts/slug/${encodeURIComponent(slug)}`;
    const lib = url.startsWith('https') ? httpsGet : httpGet;
    try {
      const req = lib(url, { timeout: 4000 }, res => {
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

const app = express();

// Archivos estáticos del build (JS, CSS, imágenes, fuentes…)
app.use(express.static(DIST, { index: false }));

// Health check — Railway lo usa para saber que el servidor está listo
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Proxy de sitemaps XML — forwarded al API que los obtiene de WordPress.
// Cubre /sitemap.xml, /sitemap_index.xml, /post-sitemap.xml, etc.
function proxyXmlFromApi(apiPath) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${apiPath}`;
    const lib = url.startsWith('https') ? httpsGet : httpGet;
    const r = lib(url, { timeout: 10000 }, resp => {
      let b = '';
      resp.on('data', d => b += d);
      resp.on('end', () => resolve({ status: resp.statusCode, body: b }));
    });
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
  });
}

app.get('/sitemap.xml', async (_req, res) => {
  const staticPath = join(DIST, 'sitemap.xml');
  if (existsSync(staticPath)) {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    return res.send(readFileSync(staticPath, 'utf-8'));
  }
  try {
    const { body } = await proxyXmlFromApi('/sitemap_index.xml');
    res.set('Content-Type', 'application/xml; charset=utf-8');
    return res.send(body);
  } catch {
    res.status(503).set('Content-Type', 'application/xml').send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
});

// /sitemap_index.xml, /post-sitemap.xml, /post-sitemap2.xml, etc.
app.get(/^\/[\w][\w-]*\.xml$/, async (req, res) => {
  try {
    const { status, body } = await proxyXmlFromApi(req.path);
    res.status(status).set('Content-Type', 'application/xml; charset=utf-8').send(body);
  } catch {
    res.status(503).set('Content-Type', 'application/xml').send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
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
