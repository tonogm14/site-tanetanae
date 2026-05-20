const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();
const WP_API = process.env.WP_API_URL || 'https://tanetanae.com/wp-json/wp/v2';

/**
 * Map a WordPress category to TT_DATA categories shape.
 */
function mapCategory(cat) {
  return {
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    count: cat.count,
    color: `var(--tt-img--${cat.slug})`,
  };
}

// GET /categories
router.get('/', cacheMiddleware(600), async (req, res) => {
  try {
    const { data } = await axios.get(`${WP_API}/categories`, {
      params: {
        per_page: 100,
        orderby: 'count',
        order: 'desc',
        hide_empty: true,
      },
      timeout: 15000,
    });

    // Filter out uncategorized and sort by count desc
    const cats = data
      .filter(c => c.slug !== 'uncategorized' && c.slug !== 'sin-categoria')
      .map(mapCategory);

    res.json(cats);
  } catch (err) {
    console.error('GET /categories error:', err.message);
    res.status(502).json({ error: 'Error fetching categories', detail: err.message });
  }
});

module.exports = router;
