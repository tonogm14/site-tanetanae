const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

// Categorías de curaduría editorial — no deben mostrarse en el frontend
const HIDDEN_CAT_SLUGS = new Set([
  'noticias-recientes', 'recientes-b', 'recientes-c',
  'centrales', 'central-2',
  'mas-noticias', 'fueron-noticias',
  'notificaciones', 'sin-categoria',
]);

/**
 * Mapea un post de WordPress al shape usado por el frontend.
 * Filtra las categorías de curaduría interna del badge de categoría.
 */
function mapPost(post) {
  const embedded = post._embedded || {};
  const featuredMedia = embedded['wp:featuredmedia']?.[0];
  const author = embedded['author']?.[0];
  const terms = embedded['wp:term'] || [];
  const allCats = terms[0] || [];

  // Usar primera categoría no-interna para visualización
  const displayCat = allCats.find(c => !HIDDEN_CAT_SLUGS.has(c.slug));
  const catSlug = displayCat?.slug || null;
  const catName = displayCat?.name || 'Delta Amacuro';
  const imgTone = displayCat?.slug || allCats[0]?.slug || 'recientes';

  const imgUrl = featuredMedia?.source_url || null;
  const authorName = author?.name || 'Tane Tanae';

  // Dates
  const dateObj = new Date(post.date);
  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dateStr = `${dateObj.getDate()} ${MONTHS_ES[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;

  // Estimate read time from content word count
  const wordCount = (post.content?.rendered || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(4, Math.round(wordCount / 200))} min`;

  // Excerpt — strip HTML tags
  const excerpt = (post.excerpt?.rendered || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[&hellip;\]/g, '…')
    .trim();

  return {
    id: String(post.id),
    slug: post.slug,
    cat: catName,
    catSlug,
    kicker: catName,
    title: post.title?.rendered
      ?.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
      .replace(/&#8230;/g, '…').replace(/&amp;/g, '&')
      .replace(/<[^>]+>/g, '') || '',
    excerpt,
    deck: excerpt,
    img: imgTone,
    imgUrl,
    author: authorName,
    authorRole: author?.description || '',
    date: dateStr,
    time: dateObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
    readTime,
    link: post.link,
    content: post.content?.rendered || '',
    tags: (embedded['wp:term']?.[1] || []).map(t => t.name),
    views: parseInt(post.meta?.contador_visitas || 0, 10),
  };
}

/**
 * Resolve a category slug to its WordPress ID.
 * We hit /categories?slug=<slug> and return the first result's ID.
 */
async function getCategoryIdBySlug(slug) {
  try {
    const { data } = await axios.get(`${WP_API}/categories`, {
      params: { slug, per_page: 1 },
      timeout: 10000,
    });
    return data[0]?.id || null;
  } catch {
    return null;
  }
}

// GET /posts?page=1&per_page=10&category=slug
router.get('/', cacheMiddleware(120), async (req, res) => {
  try {
    const { page = 1, per_page = 10, category } = req.query;
    const params = {
      page,
      per_page,
      _embed: true,
      status: 'publish',
      orderby: 'date',
      order: 'desc',
    };

    if (category) {
      const catId = await getCategoryIdBySlug(category);
      if (catId) params.categories = catId;
    }

    const { data, headers } = await axios.get(`${WP_API}/posts`, { params, timeout: 15000 });
    const totalPages = parseInt(headers['x-wp-totalpages'] || '1', 10);
    const total = parseInt(headers['x-wp-total'] || data.length, 10);

    res.json({
      posts: data.map(mapPost),
      total,
      totalPages,
      page: parseInt(page, 10),
    });
  } catch (err) {
    console.error('GET /posts error:', err.message);
    res.status(502).json({ error: 'Error fetching posts', detail: err.message });
  }
});

// GET /posts/slug/:slug
router.get('/slug/:slug', cacheMiddleware(300), async (req, res) => {
  try {
    const { data } = await axios.get(`${WP_API}/posts`, {
      params: { slug: req.params.slug, _embed: true, status: 'publish' },
      timeout: 15000,
    });
    if (!data.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapPost(data[0]));
  } catch (err) {
    console.error('GET /posts/slug/:slug error:', err.message);
    res.status(502).json({ error: 'Error fetching post', detail: err.message });
  }
});

// GET /posts/:id
router.get('/:id', cacheMiddleware(300), async (req, res) => {
  try {
    const { data } = await axios.get(`${WP_API}/posts/${req.params.id}`, {
      params: { _embed: true },
      timeout: 15000,
    });
    res.json(mapPost(data));
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Not found' });
    }
    console.error('GET /posts/:id error:', err.message);
    res.status(502).json({ error: 'Error fetching post', detail: err.message });
  }
});

module.exports = router;
