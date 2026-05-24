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
        fetched_at     TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS posts_cache_fetched ON posts_cache (fetched_at DESC);
      CREATE INDEX IF NOT EXISTS posts_cache_slug    ON posts_cache (slug);
    `);
    // Migración para instancias que ya tenían la tabla sin la columna
    await db.query(
      'ALTER TABLE posts_cache ADD COLUMN IF NOT EXISTS views_offline INTEGER NOT NULL DEFAULT 0'
    ).catch(() => {});
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
      await client.query(
        `INSERT INTO posts_cache (id, slug, data, fetched_at)
         VALUES ($1, $2, $3::jsonb, now())
         ON CONFLICT (id) DO UPDATE SET
           slug       = EXCLUDED.slug,
           data       = EXCLUDED.data,
           fetched_at = now()`,
        [p.id, p.slug, JSON.stringify(p)]
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

// Incrementa visitas offline y devuelve el total (WP views + offline).
async function incrementOfflineViews(postId) {
  const db = pool();
  if (!db) return null;
  try {
    const { rows } = await db.query(
      `UPDATE posts_cache
         SET views_offline = views_offline + 1
       WHERE id = $1
       RETURNING views_offline,
                 COALESCE((data->>'views')::int, 0) AS wp_views`,
      [String(postId)]
    );
    if (!rows.length) return null;
    return rows[0].wp_views + rows[0].views_offline;
  } catch (e) {
    console.warn('DB: error en incrementOfflineViews:', e.message);
    return null;
  }
}

// Lee y resetea a 0 las vistas offline pendientes de un post.
// Devuelve cuántas había (para sincronizarlas con WP).
async function drainOfflineViews(postId) {
  const db = pool();
  if (!db) return 0;
  try {
    const { rows } = await db.query(
      `WITH prev AS (
         SELECT views_offline FROM posts_cache WHERE id = $1
       )
       UPDATE posts_cache
         SET views_offline = 0
       WHERE id = $1
       RETURNING (SELECT views_offline FROM prev) AS drained`,
      [String(postId)]
    );
    return rows[0]?.drained || 0;
  } catch (e) {
    console.warn('DB: error en drainOfflineViews:', e.message);
    return 0;
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

// Devuelve una nota por slug desde la caché (incluye vistas offline en el total).
async function getFallbackPost(slug) {
  const db = pool();
  if (!db) return null;
  try {
    const { rows } = await db.query(
      'SELECT data, views_offline FROM posts_cache WHERE slug = $1 LIMIT 1',
      [slug]
    );
    if (!rows.length) return null;
    const post = { ...rows[0].data };
    const offline = rows[0].views_offline || 0;
    if (offline > 0) post.views = (post.views || 0) + offline;
    return post;
  } catch (e) {
    console.warn('DB: error en fallback de post:', e.message);
    return null;
  }
}

module.exports = {
  initSchema,
  upsertPosts,
  incrementOfflineViews,
  drainOfflineViews,
  getFallbackPosts,
  getFallbackPost,
};
