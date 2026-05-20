import axios from 'axios';
import Constants from 'expo-constants';

const WP_API = Constants.expoConfig?.extra?.wpApiUrl
  || process.env.EXPO_PUBLIC_WP_API_URL
  || 'https://tanetanae.com/wp-json/wp/v2';

// Optional proxy API (set EXPO_PUBLIC_API_URL to your Express server IP/domain)
// If set, fetchHome() uses one fast cached request instead of many WP calls.
const API_URL = process.env.EXPO_PUBLIC_API_URL || null;

const client = axios.create({ baseURL: WP_API, timeout: 15000 });
const apiClient = API_URL ? axios.create({ baseURL: API_URL, timeout: 20000 }) : null;

function decodeHtml(str = '') {
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function mapPost(post) {
  const embedded = post._embedded || {};
  const featuredMedia = embedded['wp:featuredmedia']?.[0];
  const author = embedded['author']?.[0];
  const terms = embedded['wp:term'] || [];
  const cat = (terms[0] || [])[0];
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
    title: decodeHtml(post.title?.rendered || ''),
    excerpt,
    deck: excerpt,
    img: catSlug,
    imgUrl,
    author: author?.name || 'Tane Tanae',
    authorRole: author?.description || '',
    date: dateStr,
    readTime,
    link: post.link,
    content: post.content?.rendered || '',
  };
}

// ── Mock data ────────────────────────────────────────────
export const MOCK = {
  breaking: [
    'Inicia Plan Nacional Quirúrgico para pacientes con cataratas en Delta Amacuro',
    'Alcaldía de Tucupita ejecuta operativo de patroleo en 6 sectores',
    'Lácteos Delta arranca distribución formal en cadenas del estado',
    'Gobernadora Loa Tamaronis se reúne con líderes del Bajo Delta',
  ],
  categories: [
    { slug: 'sucesos',  name: 'Sucesos' },
    { slug: 'deportes', name: 'Deportes' },
    { slug: 'politica', name: 'Política' },
    { slug: 'tucupita', name: 'Tucupita' },
    { slug: 'cultura',  name: 'Cultura' },
    { slug: 'salud',    name: 'Salud' },
    { slug: 'sociales', name: 'Sociales' },
  ],
  hero: [
    { id: 'h1', cat: 'Política', catSlug: 'politica', title: 'Asnardo hará valer en Caracas la posición geopolítica estratégica del Delta', excerpt: 'El parlamentario regional adelantó la agenda con autoridades nacionales.', img: 'politica', author: 'Toni Medina', date: 'Hoy, 9:42 AM', readTime: '5 min', slug: 'articulo-1' },
    { id: 'h2', cat: 'Salud', catSlug: 'salud', title: 'Inicia Plan Nacional Quirúrgico para pacientes con cataratas', excerpt: 'Doce hospitales del país atenderán a más de 2.000 deltanos.', img: 'salud', author: 'Prensa Gobernación', date: 'Hoy, 7:15 AM', readTime: '4 min', slug: 'articulo-2' },
    { id: 'h3', cat: 'Deportes', catSlug: 'deportes', title: 'Delta Amacuro presente en el Festival Nacional de Tenis de Mesa', excerpt: 'Víctor Pinto Jr. encabeza la delegación U7/U9.', img: 'deportes', author: 'Clark Kent', date: 'Ayer', readTime: '3 min', slug: 'articulo-3' },
    { id: 'h4', cat: 'Cultura', catSlug: 'cultura', title: 'Comunidades deltanas buscan mantener vivas sus tradiciones navideñas', excerpt: 'Entre tambores, gaitas y aguinaldos.', img: 'cultura', author: 'Tane Tanae', date: 'Lunes', readTime: '6 min', slug: 'articulo-4' },
  ],
  mostRead: [
    { id: 'mr1', title: "A 'cascazos' le reclamó un presunto hurto y ahora pernocta en el SIP", cat: 'Sucesos', catSlug: 'sucesos', img: 'sucesos', slug: 'art-1' },
    { id: 'mr2', title: 'Lácteos Delta inicia formalmente sus operaciones tras un mes de pruebas', cat: 'Economía', catSlug: 'politica', img: 'politica', slug: 'art-2' },
    { id: 'mr3', title: 'Carlos Figuera anuncia novedades en Tenis de Mesa', cat: 'Deportes', catSlug: 'deportes', img: 'deportes', slug: 'art-3' },
    { id: 'mr4', title: 'Hurtos de ganado vuelven a alarmar al sector pecuario', cat: 'Sucesos', catSlug: 'sucesos', img: 'sucesos', slug: 'art-4' },
    { id: 'mr5', title: 'Loa Tamaronis recibe a la Federación Venezolana de Taekwondo', cat: 'Política', catSlug: 'politica', img: 'politica', slug: 'art-5' },
  ],
  sucesos: [
    { id: 's1', title: 'Policía Delta Amacuro protege a niños en situación de calle en Tucupita', excerpt: 'Articulación con el gobierno regional.', img: 'sucesos', date: '23 mar', author: 'Tane Tanae', cat: 'Sucesos', catSlug: 'sucesos', slug: 'suc-1' },
    { id: 's2', title: 'Ciudadano cae a alcantarilla destapada en el paseo Manamo', excerpt: 'Vecinos exigen a la alcaldía un cronograma.', img: 'sucesos', date: '23 mar', author: 'Tanetanae', cat: 'Sucesos', catSlug: 'sucesos', slug: 'suc-2' },
  ],
  deportes: [
    { id: 'd1', title: 'Fútbol de campo deltano sueña en grande de cara a los Juegos 2026', excerpt: 'La Sub-17 ya tiene los 20 atletas.', img: 'deportes', date: '19 feb', author: 'Fredery Marcano', cat: 'Deportes', catSlug: 'deportes', slug: 'dep-1' },
  ],
  tucupita: [
    { id: 't1', title: 'Operativo de nivelación y patroleo arranca en 6 sectores', excerpt: 'La alcaldía prevé cubrir 14 km.', img: 'tucupita', date: '18 abr', author: 'Alcaldía', cat: 'Tucupita', catSlug: 'tucupita', slug: 'tuc-1' },
    { id: 't2', title: "Por puestos suben el pasaje 'para el aguinaldo'", excerpt: 'Usuarios protestan.', img: 'tucupita', date: '12 dic', author: 'Tane Tanae', cat: 'Tucupita', catSlug: 'tucupita', slug: 'tuc-2' },
  ],
  article: {
    id: 'art-1', cat: 'Política', catSlug: 'politica',
    title: 'Asnardo hará valer en Caracas la posición geopolítica estratégica del Delta',
    deck: 'El parlamentario regional adelantó una agenda intensa con autoridades nacionales.',
    author: 'Toni Medina', authorRole: 'Editor de Política · Kaina TV',
    date: '14 de mayo de 2026', readTime: '5 min', img: 'politica', slug: 'articulo-1',
    body: [
      { type: 'p', lead: true, text: 'El parlamentario Asnardo Rodríguez Santaella confirmó este miércoles que sostendrá tres reuniones consecutivas en Caracas.' },
      { type: 'p', text: 'El objetivo es destrabar tres proyectos detenidos desde 2023.' },
      { type: 'quote', text: 'El Delta no es una región periférica. Es la puerta marítima del país.', who: 'Asnardo Rodríguez Santaella' },
    ],
  },
};

// ── API Functions ────────────────────────────────────────

async function safeGet(url, params = {}) {
  try {
    return await client.get(url, { params });
  } catch {
    return null;
  }
}

// Category ID cache to avoid duplicate lookups
const catCache = new Map();
async function getCatId(slug) {
  if (catCache.has(slug)) return catCache.get(slug);
  try {
    const res = await client.get('/categories', { params: { slug, per_page: 1 } });
    const id = res.data[0]?.id || null;
    if (id) catCache.set(slug, id);
    return id;
  } catch { return null; }
}

// fetchHome — ONE request via proxy, or parallel WP calls if no proxy configured
export async function fetchHome() {
  // If API proxy URL is set, use the fast /home endpoint (cached server-side)
  if (apiClient) {
    try {
      const { data } = await apiClient.get('/home');
      return { ...MOCK, ...data };
    } catch { /* fall through to direct WP calls */ }
  }

  // Direct WP API: resolve category IDs first, then fetch all sections in parallel
  await Promise.all(['sucesos','deportes','tucupita','cultura','ultima-hora']
    .map(slug => getCatId(slug)));

  const fetchSection = async (perPage, catSlug, orderby = 'date') => {
    try {
      const params = { per_page: perPage, _embed: 1, status: 'publish', orderby, order: 'desc',
        _fields: 'id,slug,title,excerpt,date,link,_links,_embedded' };
      if (catSlug) { const id = catCache.get(catSlug); if (id) params.categories = id; }
      const res = await client.get('/posts', { params });
      return res.data.map(mapPost);
    } catch { return []; }
  };

  const fetchBreakingItems = async () => {
    try {
      const params = { per_page: 5, status: 'publish', orderby: 'date', order: 'desc', _fields: 'id,title' };
      const catId = catCache.get('ultima-hora');
      if (catId) params.categories = catId;
      const res = await client.get('/posts', { params });
      return res.data.map(p => decodeHtml(p.title?.rendered || ''));
    } catch { return MOCK.breaking; }
  };

  const [breaking, hero, sucesos, deportes, tucupita, mostRead] = await Promise.allSettled([
    fetchBreakingItems(),
    fetchSection(4),
    fetchSection(3, 'sucesos'),
    fetchSection(3, 'deportes'),
    fetchSection(3, 'tucupita'),
    fetchSection(5, null, 'comment_count'),
  ]);

  const ok = r => r.status === 'fulfilled' ? r.value : [];
  return {
    ...MOCK,
    breaking: ok(breaking).length ? ok(breaking) : MOCK.breaking,
    hero:     ok(hero).length     ? ok(hero)     : MOCK.hero,
    sucesos:  ok(sucesos).length  ? ok(sucesos)  : MOCK.sucesos,
    deportes: ok(deportes).length ? ok(deportes) : MOCK.deportes,
    tucupita: ok(tucupita).length ? ok(tucupita) : MOCK.tucupita,
    mostRead: ok(mostRead).length ? ok(mostRead) : MOCK.mostRead,
  };
}

export async function fetchPosts({ page = 1, perPage = 10, category } = {}) {
  try {
    const params = { page, per_page: perPage, _embed: true, status: 'publish', orderby: 'date', order: 'desc' };
    if (category) {
      const catsRes = await safeGet('/categories', { slug: category, per_page: 1 });
      if (catsRes?.data?.[0]?.id) params.categories = catsRes.data[0].id;
    }
    const res = await client.get('/posts', { params });
    return {
      posts: res.data.map(mapPost),
      total: parseInt(res.headers['x-wp-total'] || res.data.length, 10),
      totalPages: parseInt(res.headers['x-wp-totalpages'] || '1', 10),
    };
  } catch {
    const fallback = category ? (MOCK[category] || MOCK.hero) : MOCK.hero;
    return { posts: Array.isArray(fallback) ? fallback : MOCK.hero, total: 0, totalPages: 1 };
  }
}

export async function fetchPost(slug) {
  try {
    const res = await client.get('/posts', { params: { slug, _embed: true } });
    if (!res.data.length) return MOCK.article;
    return mapPost(res.data[0]);
  } catch {
    return MOCK.article;
  }
}

export async function fetchBreaking() {
  try {
    const catsRes = await safeGet('/categories', { slug: 'ultima-hora', per_page: 1 });
    const params = { per_page: 5, status: 'publish', orderby: 'date', order: 'desc' };
    if (catsRes?.data?.[0]?.id) params.categories = catsRes.data[0].id;
    const res = await client.get('/posts', { params });
    if (!res.data.length) throw new Error('empty');
    return res.data.map(p => decodeHtml(p.title?.rendered || ''));
  } catch {
    return MOCK.breaking;
  }
}

export async function fetchHero() {
  try {
    const res = await client.get('/posts', {
      params: { per_page: 4, _embed: true, status: 'publish', orderby: 'date', order: 'desc' },
    });
    return res.data.map(mapPost);
  } catch {
    return MOCK.hero;
  }
}

export async function fetchCategories() {
  try {
    const res = await client.get('/categories', { params: { per_page: 50, orderby: 'count', order: 'desc', hide_empty: true } });
    return res.data
      .filter(c => c.slug !== 'uncategorized' && c.slug !== 'sin-categoria')
      .map(c => ({ id: c.id, slug: c.slug, name: c.name, count: c.count }));
  } catch {
    return MOCK.categories;
  }
}

export async function fetchMostRead() {
  try {
    const res = await client.get('/posts', {
      params: { per_page: 5, _embed: true, status: 'publish', orderby: 'comment_count', order: 'desc' },
    });
    return res.data.map(mapPost);
  } catch {
    return MOCK.mostRead;
  }
}

export async function searchPosts(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await client.get('/posts', {
      params: { search: query.trim(), per_page: 10, _embed: true, status: 'publish' },
    });
    return res.data.map(mapPost);
  } catch {
    return [];
  }
}
