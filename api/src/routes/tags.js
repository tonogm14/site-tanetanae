const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

// GET /tags/:slug — info de un tag específico
router.get('/:slug', cacheMiddleware(3600), async (req, res) => {
  const { slug } = req.params;
  if (slug === 'trending') return res.status(400).json({ error: 'Use /tags/trending' });
  try {
    const { data } = await axios.get(`${WP_API}/tags`, {
      params: { slug, per_page: 1 },
      timeout: 10000,
    });
    if (!data.length) return res.status(404).json({ error: 'Tag not found' });
    const t = data[0];
    res.json({ id: t.id, slug: t.slug, name: t.name, count: t.count });
  } catch (err) {
    console.error('GET /tags/:slug error:', err.message);
    res.status(502).json({ error: 'Error fetching tag' });
  }
});

// GET /tags/trending — top 8 tags by post count, cached 24h
router.get('/trending', cacheMiddleware(86400), async (req, res) => {
  try {
    const { data } = await axios.get(`${WP_API}/tags`, {
      params: { orderby: 'count', order: 'desc', per_page: 8, hide_empty: true },
      timeout: 10000,
    });
    res.json(data.map(t => ({ id: t.id, name: t.name, slug: t.slug, count: t.count })));
  } catch (err) {
    console.error('GET /tags/trending error:', err.message);
    res.status(502).json({ error: 'Error fetching tags' });
  }
});

module.exports = router;
