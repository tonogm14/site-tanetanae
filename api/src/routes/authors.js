const express = require('express');
const axios   = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

// GET /authors/:slug — info del autor (nombre, bio, avatar)
router.get('/:slug', cacheMiddleware(3600), async (req, res) => {
  const { slug } = req.params;
  try {
    const { data } = await axios.get(`${WP_API}/users`, {
      params: { slug, per_page: 1 },
      timeout: 10000,
    });
    if (!data.length) return res.status(404).json({ error: 'Author not found' });
    const u = data[0];
    res.json({
      id:     u.id,
      slug:   u.slug,
      name:   u.name,
      bio:    u.description || '',
      avatar: u.avatar_urls?.['96'] || u.avatar_urls?.['48'] || null,
      link:   u.link || null,
    });
  } catch (err) {
    console.error('GET /authors/:slug error:', err.message);
    res.status(502).json({ error: 'Error fetching author', detail: err.message });
  }
});

module.exports = router;
