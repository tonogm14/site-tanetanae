const { Pool } = require('pg');

let _pool = null;

function pool() {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const ssl = process.env.DATABASE_SSL === 'false'
    ? false
    : { rejectUnauthorized: false };
  _pool = new Pool({ connectionString: url, ssl });
  _pool.on('error', err => console.warn('DB pool error:', err.message));
  return _pool;
}

async function initSchema() {
  const db = pool();
  if (!db) {
    console.log('DB: DATABASE_URL no configurado — fallback desactivado');
    return;
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts_cache (
        id             TEXT PRIMARY KEY,
        slug           TEXT NOT NULL,
        data           JSONB NOT NULL,
        views_offline  INTEGER NOT NULL DEFAULT 0,
        view_count     INTEGER NOT NULL DEFAULT 0,
        fetched_at     TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS posts_cache_fetched ON posts_cache (fetched_at DESC);
      CREATE INDEX IF NOT EXISTS posts_cache_slug    ON posts_cache (slug);

      CREATE TABLE IF NOT EXISTS comments (
        id          BIGSERIAL PRIMARY KEY,
        post_id     TEXT NOT NULL,
        author_name TEXT NOT NULL,
        content     TEXT NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS comments_post_idx ON comments (post_id, created_at DESC);
    `);
    // Columnas para instancias que ya existían sin ellas
    await db.query('ALTER TABLE posts_cache ADD COLUMN IF NOT EXISTS views_offline INTEGER NOT NULL DEFAULT 0').catch(() => {});
    await db.query('ALTER TABLE posts_cache ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0').catch(() => {});
    // Migración única: inicializar view_count desde views_offline + vistas de WP
    await db.query(`
      UPDATE posts_cache
      SET view_count = COALESCE((data->>'views')::int, 0) + COALESCE(views_offline, 0)
      WHERE view_count = 0
        AND (COALESCE((data->>'views')::int, 0) + COALESCE(views_offline, 0)) > 0
    `).catch(() => {});
    console.log('DB: esquema listo');
  } catch (e) {
    console.warn('DB: error al inicializar esquema:', e.message);
  }
}

// Guarda posts en DB; conserva solo las 100 más recientes.
async function upsertPosts(posts) {
  const db = pool();
  if (!db || !posts?.length) return;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const p of posts) {
      if (!p?.id || !p?.slug) continue;
      const wpViews = parseInt(p.views || 0, 10);
      await client.query(
        // En INSERT: inicializar view_count desde WP si PostgreSQL aún tiene 0
        // En UPDATE: NO sobreescribir view_count — PostgreSQL es la fuente de verdad
        `INSERT INTO posts_cache (id, slug, data, view_count, fetched_at)
         VALUES ($1, $2, $3::jsonb, $4, now())
         ON CONFLICT (id) DO UPDATE SET
           slug       = EXCLUDED.slug,
           data       = EXCLUDED.data,
           view_count = GREATEST(posts_cache.view_count, EXCLUDED.view_count),
           fetched_at = now()`,
        [p.id, p.slug, JSON.stringify(p), wpViews]
      );
    }
    // Mantener máximo 100 notas
    await client.query(`
      DELETE FROM posts_cache
      WHERE id NOT IN (
        SELECT id FROM posts_cache ORDER BY fetched_at DESC LIMIT 100
      )
    `);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.warn('DB: error en upsert:', e.message);
  } finally {
    client.release();
  }
}

// Incrementa view_count atómicamente y devuelve el nuevo total.
// PostgreSQL es la fuente de verdad; WP se sincroniza en background.
async function incrementViewCount(postId) {
  const db = pool();
  if (!db) return null;
  try {
    const { rows } = await db.query(
      `UPDATE posts_cache
         SET view_count = view_count + 1
       WHERE id = $1
       RETURNING view_count`,
      [String(postId)]
    );
    return rows[0]?.view_count ?? null;
  } catch (e) {
    console.warn('DB: error en incrementViewCount:', e.message);
    return null;
  }
}

// Fuerza view_count al valor dado si es mayor al actual.
// Usado para inicializar desde el historial real de WP en la primera visita.
async function setViewCount(postId, count) {
  const db = pool();
  if (!db) return;
  try {
    await db.query(
      'UPDATE posts_cache SET view_count = GREATEST(view_count, $2) WHERE id = $1',
      [String(postId), count]
    );
  } catch (e) {
    console.warn('DB: error en setViewCount:', e.message);
  }
}

// Devuelve hasta N notas de una categoría específica desde la caché.
async function getFallbackPostsByCategory(catSlug, limit = 12) {
  const db = pool();
  if (!db) return [];
  try {
    const { rows } = await db.query(
      `SELECT data FROM posts_cache
       WHERE data->>'catSlug' = $1
       ORDER BY fetched_at DESC LIMIT $2`,
      [catSlug, limit]
    );
    return rows.map(r => r.data);
  } catch (e) {
    console.warn('DB: error en fallback por categoría:', e.message);
    return [];
  }
}

// Devuelve las últimas N notas cacheadas (para fallback de home / listados).
async function getFallbackPosts(limit = 12) {
  const db = pool();
  if (!db) return [];
  try {
    const { rows } = await db.query(
      'SELECT data FROM posts_cache ORDER BY fetched_at DESC LIMIT $1',
      [limit]
    );
    return rows.map(r => r.data);
  } catch (e) {
    console.warn('DB: error en fallback de lista:', e.message);
    return [];
  }
}

// Devuelve una nota por slug desde la caché.
// Retorna { post, fetchedAt } para que el llamador pueda decidir si refrescar.
async function getFallbackPost(slug) {
  const db = pool();
  if (!db) return null;
  try {
    const { rows } = await db.query(
      'SELECT data, view_count, fetched_at FROM posts_cache WHERE slug = $1 LIMIT 1',
      [slug]
    );
    if (!rows.length) return null;
    const post = { ...rows[0].data };
    // view_count en PostgreSQL es la fuente de verdad — sobreescribe el valor de WP
    if (rows[0].view_count > 0) post.views = rows[0].view_count;
    return { post, fetchedAt: rows[0].fetched_at };
  } catch (e) {
    console.warn('DB: error en fallback de post:', e.message);
    return null;
  }
}

// Devuelve cuántas notas hay en la caché.
async function getPostCount() {
  const db = pool();
  if (!db) return 0;
  try {
    const { rows } = await db.query('SELECT COUNT(*) AS n FROM posts_cache');
    return parseInt(rows[0]?.n ?? 0, 10);
  } catch {
    return 0;
  }
}

// Guarda un comentario aprobado y lo devuelve con su id y fecha.
async function saveComment(postId, authorName, content) {
  const db = pool();
  if (!db) throw new Error('DB no disponible');
  const { rows } = await db.query(
    `INSERT INTO comments (post_id, author_name, content)
     VALUES ($1, $2, $3)
     RETURNING id, author_name AS author, content, created_at AS date`,
    [String(postId), authorName, content]
  );
  return rows[0];
}

// Devuelve comentarios paginados de un post y el total.
async function getComments(postId, { page = 1, limit = 5 } = {}) {
  const db = pool();
  if (!db) return { comments: [], total: 0 };
  const offset = (Math.max(1, page) - 1) * limit;
  try {
    const [{ rows: comments }, { rows: countRows }] = await Promise.all([
      db.query(
        `SELECT id, author_name AS author, content, created_at AS date
         FROM comments WHERE post_id = $1
         ORDER BY created_at ASC
         LIMIT $2 OFFSET $3`,
        [String(postId), limit, offset]
      ),
      db.query(
        'SELECT COUNT(*) AS total FROM comments WHERE post_id = $1',
        [String(postId)]
      ),
    ]);
    return { comments, total: parseInt(countRows[0]?.total ?? 0, 10) };
  } catch (e) {
    console.warn('DB: error en getComments:', e.message);
    return { comments: [], total: 0 };
  }
}

module.exports = {
  initSchema,
  upsertPosts,
  incrementViewCount,
  setViewCount,
  getFallbackPosts,
  getFallbackPostsByCategory,
  getFallbackPost,
  getPostCount,
  saveComment,
  getComments,
};
