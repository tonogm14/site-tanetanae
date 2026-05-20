const express = require('express');
const axios = require('axios');

const router = express.Router();
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

function mapPost(post) {
  const embedded = post._embedded || {};
  const featuredMedia = embedded['wp:featuredmedia']?.[0];
  const author = embedded['author']?.[0];
  const terms = embedded['wp:term'] || [];
  const categories = terms[0] || [];
  const cat = categories[0];
  const catSlug = cat?.slug || 'recientes';
  const catName = cat?.name || 'Recientes';
  const imgUrl = featuredMedia?.source_url || null;
  const dateObj = new Date(post.date);
  const dateStr = dateObj.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
  const wordCount = (post.content?.rendered || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;
  const excerpt = (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').replace(/\[&hellip;\]/g, '…').trim();

  return {
    id: String(post.id),
    slug: post.slug,
    cat: catName,
    catSlug,
    title: post.title?.rendered?.replace(/&#8217;/g, "'").replace(/&amp;/g, '&').replace(/&#8230;/g, '…') || '',
    excerpt,
    img: catSlug,
    imgUrl,
    author: author?.name || 'Tane Tanae',
    date: dateStr,
    readTime,
    link: post.link,
  };
}

// GET /search?q=query&page=1&per_page=10
router.get('/', async (req, res) => {
  const { q, page = 1, per_page = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ results: [], total: 0, query: q || '' });
  }

  try {
    const { data, headers } = await axios.get(`${WP_API}/posts`, {
      params: {
        search: q.trim(),
        page,
        per_page,
        _embed: true,
        status: 'publish',
        orderby: 'relevance',
      },
      timeout: 15000,
    });

    const total = parseInt(headers['x-wp-total'] || data.length, 10);

    res.json({
      results: data.map(mapPost),
      total,
      query: q.trim(),
      page: parseInt(page, 10),
    });
  } catch (err) {
    // WP returns 400 for empty search results sometimes
    if (err.response?.status === 400) {
      return res.json({ results: [], total: 0, query: q });
    }
    console.error('GET /search error:', err.message);
    res.status(502).json({ error: 'Error executing search', detail: err.message });
  }
});

module.exports = router;
