const express = require('express');
const axios = require('axios');

const router = express.Router();
const WP_BASE = (process.env.WP_BASE || 'https://www.tanetanae.com').replace(/\/$/, '');

const URL_RE = /(https?:\/\/|www\.)/i;

// GET /comments/:postId
router.get('/:postId', async (req, res) => {
  try {
    const { data } = await axios.get(
      `${WP_BASE}/wp-json/tt/v1/comments/${req.params.postId}`,
      { timeout: 8000 }
    );
    res.json(Array.isArray(data) ? data : []);
  } catch {
    res.json([]);
  }
});

// POST /comments/:postId
router.post('/:postId', async (req, res) => {
  const { author_name, content } = req.body || {};

  if (!author_name?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Nombre y comentario son requeridos.' });
  }
  if (URL_RE.test(content)) {
    return res.status(400).json({ error: 'Los comentarios no pueden contener enlaces.' });
  }
  if (content.trim().length < 5) {
    return res.status(400).json({ error: 'El comentario es muy corto.' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: 'El comentario no puede tener mas de 1000 caracteres.' });
  }

  try {
    const { data } = await axios.post(
      `${WP_BASE}/wp-json/tt/v1/comment`,
      {
        post_id:     parseInt(req.params.postId, 10),
        author_name: author_name.trim(),
        content:     content.trim(),
      },
      { timeout: 8000 }
    );
    res.json(data);
  } catch (e) {
    const msg = e.response?.data?.message || 'Error al enviar el comentario.';
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

module.exports = router;
