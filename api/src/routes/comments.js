const express = require('express');
const { saveComment, getComments } = require('../db');

const router = express.Router();

// Rechaza: http/https, www., @, correos, TLDs comunes
const SPAM_RE = /https?|www\.|@|\.(com|net|org|io|ve|info|co|app|xyz)\b/i;

// GET /comments/:postId?page=1
router.get('/:postId', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const result = await getComments(req.params.postId, { page, limit: 5 });
  res.json(result);
});

// POST /comments/:postId
router.post('/:postId', express.json(), async (req, res) => {
  const { author_name, content } = req.body || {};

  if (!author_name?.trim())
    return res.status(400).json({ error: 'El nombre es requerido.' });
  if (!content?.trim())
    return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
  if (content.trim().length < 5)
    return res.status(400).json({ error: 'El comentario es muy corto.' });
  if (content.length > 1000)
    return res.status(400).json({ error: 'El comentario no puede tener más de 1000 caracteres.' });
  if (SPAM_RE.test(content) || SPAM_RE.test(author_name))
    return res.status(400).json({ error: 'El comentario no puede contener enlaces, correos ni @.' });

  try {
    const comment = await saveComment(req.params.postId, author_name.trim(), content.trim());
    res.json(comment);
  } catch (e) {
    console.error('POST /comments error:', e.message);
    res.status(500).json({ error: 'No se pudo guardar el comentario. Intenta de nuevo.' });
  }
});

module.exports = router;
