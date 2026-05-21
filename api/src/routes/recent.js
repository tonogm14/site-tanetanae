const express = require('express');
const axios = require('axios');

const router = express.Router();
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

const HIDDEN_CAT_SLUGS = new Set([
  'noticias-recientes', 'recientes-b', 'recientes-c',
  'centrales', 'central-2', 'mas-noticias', 'fueron-noticias',
  'notificaciones', 'sin-categoria',
]);

function mapPost(post) {
  const embedded = post._embedded || {};
  const featuredMedia = embedded['wp:featuredmedia']?.[0];
  const author = embedded['author']?.[0];
  const terms = embedded['wp:term'] || [];
  const allCats = terms[0] || [];
  const displayCat = allCats.find(c => !HIDDEN_CAT_SLUGS.has(c.slug));
  const catName = displayCat?.name || 'Delta Amacuro';
  const catSlug = displayCat?.slug || null;
  const imgTone = displayCat?.slug || allCats[0]?.slug || 'recientes';
  const imgUrl = featuredMedia?.source_url || null;
  const dateObj = new Date(post.date);
  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dateStr = `${dateObj.getDate()} ${MONTHS_ES[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
  const wordCount = (post.content?.rendered || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(4, Math.round(wordCount / 200))} min`;
  const excerpt = (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').replace(/\[&hellip;\]/g, '…').trim();
  const title = (post.title?.rendered || '')
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…').replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '');

  return {
    id: String(post.id), slug: post.slug, cat: catName, catSlug,
    title, excerpt, img: imgTone, imgUrl,
    author: author?.name || 'Tane Tanae',
    date: dateStr, readTime,
    commentStatus: post.comment_status || 'closed',
  };
}

// Venezuela = UTC-4 (sin horario de verano)
function getVeRangeForDay(daysBack = 0) {
  const VE_OFFSET_MS = 4 * 60 * 60 * 1000;
  const veNow = new Date(Date.now() - VE_OFFSET_MS);
  const target = new Date(veNow);
  if (daysBack > 0) target.setUTCDate(target.getUTCDate() - daysBack);
  const veStart = new Date(target); veStart.setUTCHours(0, 0, 0, 0);
  const veEnd   = new Date(target); veEnd.setUTCHours(23, 59, 59, 999);
  return {
    after:  new Date(veStart.getTime() + VE_OFFSET_MS).toISOString(),
    before: new Date(veEnd.getTime()   + VE_OFFSET_MS).toISOString(),
  };
}

async function fetchDay(range, perPage, page = 1) {
  const { data, headers } = await axios.get(`${WP_API}/posts`, {
    params: { ...range, per_page: perPage, page, _embed: true, status: 'publish', orderby: 'date', order: 'desc' },
    timeout: 15000,
  });
  return {
    posts: data.map(mapPost),
    total: parseInt(headers['x-wp-total'] || data.length, 10),
    totalPages: parseInt(headers['x-wp-totalpages'] || '1', 10),
  };
}

// GET /recent?day=today|yesterday&page=1&per_page=12&fill=true
// fill=true: if primary day has fewer than 12 posts, complete with the previous day
router.get('/', async (req, res) => {
  const day     = req.query.day === 'yesterday' ? 'yesterday' : 'today';
  const page    = Math.max(1, parseInt(req.query.page     || '1',  10));
  const perPage = Math.min(24, parseInt(req.query.per_page || '12', 10));
  const fill    = req.query.fill === 'true';
  const MIN_FILL = 12;

  const daysBack = day === 'yesterday' ? 1 : 0;
  const primaryRange = getVeRangeForDay(daysBack);

  try {
    if (fill) {
      // Fetch all posts from primary day (up to 100)
      const { data: primaryData } = await axios.get(`${WP_API}/posts`, {
        params: { ...primaryRange, per_page: 100, _embed: true, status: 'publish', orderby: 'date', order: 'desc' },
        timeout: 15000,
      });
      let allPosts = primaryData.map(mapPost);

      // If not enough, fetch from fallback day
      if (allPosts.length < MIN_FILL) {
        const fallbackRange = getVeRangeForDay(daysBack + 1);
        const needed = MIN_FILL - allPosts.length;
        try {
          const { data: fallbackData } = await axios.get(`${WP_API}/posts`, {
            params: { ...fallbackRange, per_page: Math.min(needed + 5, 20), _embed: true, status: 'publish', orderby: 'date', order: 'desc' },
            timeout: 15000,
          });
          allPosts = [...allPosts, ...fallbackData.map(mapPost)];
        } catch {
          // fallback day fetch failed — use what we have
        }
      }

      const total      = allPosts.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const start      = (page - 1) * perPage;
      const posts      = allPosts.slice(start, start + perPage);

      return res.json({ posts, total, totalPages, page, day });
    }

    // Normal mode: WP handles pagination server-side
    const result = await fetchDay(primaryRange, perPage, page);
    res.json({ posts: result.posts, total: result.total, totalPages: result.totalPages, page, day });
  } catch {
    res.json({ posts: [], total: 0, totalPages: 1, page, day });
  }
});

module.exports = router;
