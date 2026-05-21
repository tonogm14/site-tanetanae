const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();
const WP_BASE = (process.env.WP_BASE || 'https://www.tanetanae.com').replace(/\/$/, '');

// Sections that can have banners (must match WordPress config)
const BANNER_SECTIONS = [
  'hero', 'mas-noticias', 'sucesos-deportes', 'fueron-noticias',
  'videos', 'indigena', 'internacional',
  'articulo-cuerpo', 'articulo-sidebar',
  'home-sidebar-top', 'home-sidebar-bottom',
  'categoria-top', 'categoria-bottom',
];

router.get('/', cacheMiddleware(120), async (_req, res) => {
  try {
    const { data } = await axios.get(`${WP_BASE}/wp-json/tt/v1/banners`, { timeout: 8000 });
    res.json(data);
  } catch {
    // Return empty config — banners just won't show
    const empty = {};
    BANNER_SECTIONS.forEach(s => { empty[s] = { enabled: false, image_url: '', link_url: '', new_tab: false }; });
    res.json(empty);
  }
});

module.exports = router;
