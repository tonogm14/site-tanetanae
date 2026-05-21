import axios from 'axios';

// En dev: Vite proxea /api → http://localhost:3002 (sin CORS)
// En prod: setear VITE_API_URL a la URL del servidor desplegado
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// ── Mock data — fallback cuando la API no es alcanzable ───
// Refleja la estructura de secciones editoriales real.
export const MOCK_DATA = {
  breaking: [
    'Inicia Plan Nacional Quirúrgico para pacientes con cataratas en Delta Amacuro',
    'Alcaldía de Tucupita ejecuta operativo de patroleo en 6 sectores',
    'Lácteos Delta arranca distribución formal en cadenas del estado',
    'Gobernadora Loa Tamaronis se reúne con líderes del Bajo Delta',
  ],
  // Categorías de contenido público (no las de curaduría interna)
  categories: [
    { slug: 'sucesos',           name: 'Sucesos',           color: '' },
    { slug: 'deportes',          name: 'Deportes',          color: '' },
    { slug: 'indigenas',         name: 'Indígena',          color: '' },
    { slug: 'trinidad-y-tobago', name: 'Trinidad y Tobago', color: '' },
    { slug: 'guyana',            name: 'Guyana',            color: '' },
    { slug: 'videos',            name: 'Video',             color: '' },
  ],
  // Bloque recientes → hero mosaic (5 notas curadas por el equipo)
  hero: [
    { id: 'h1', cat: 'Indígena',  catSlug: 'indigena',          kicker: 'Warao', title: 'Comunidades warao del Bajo Delta buscan preservar sus tradiciones ancestrales', excerpt: 'Entre tambores y aguinaldos, los pueblos indígenas resisten al olvido.', img: 'indigena',          author: 'Tane Tanae', date: 'Hoy, 9:42 AM', readTime: '5 min', slug: 'warao-tradiciones' },
    { id: 'h2', cat: 'Sucesos',   catSlug: 'suceso',            kicker: 'Delta Amacuro', title: 'Ciudadano cae a alcantarilla destapada en el paseo Manamo de Tucupita', excerpt: 'Vecinos exigen a la alcaldía un cronograma de reparación urgente.', img: 'suceso',            author: 'Tane Tanae', date: 'Hoy, 7:15 AM', readTime: '2 min', slug: 'alcantarilla-manamo' },
    { id: 'h3', cat: 'Deportes',  catSlug: 'deporte',           kicker: 'Tenis de mesa', title: 'Delta Amacuro presente en el 1er Festival Nacional de Tenis de Mesa 2026', excerpt: 'Víctor Pinto Jr. encabeza la delegación U7/U9.', img: 'deporte',           author: 'Clark Kent', date: 'Ayer, 6:30 PM', readTime: '3 min', slug: 'tenis-mesa-2026' },
    { id: 'h4', cat: 'Video',     catSlug: 'video',             kicker: 'Cobertura especial', title: 'EN VIDEO: Operativo de nivelación arranca en seis sectores de Tucupita', excerpt: 'La alcaldía prevé cubrir 14 km de vialidad urbana durante marzo.', img: 'video',             author: 'Alcaldía', date: 'Lunes, 11:20 AM', readTime: '4 min', slug: 'operativo-tucupita-video' },
    { id: 'h5', cat: 'Indígena',  catSlug: 'indigena',          kicker: 'Delta Amacuro', title: 'Saberes compartidos: delegados internacionales visitan comunidades deltanas', excerpt: 'El intercambio refuerza la visibilidad de la cultura warao.', img: 'indigena',          author: 'Tane Tanae', date: 'Hoy, 6:00 AM', readTime: '4 min', slug: 'saberes-compartidos' },
  ],
  centrales: [
    { id: 'c1', cat: 'Sucesos',  catSlug: 'suceso',  title: 'Policía Delta Amacuro protege a niños en situación de calle', excerpt: 'Articulación con el gobierno regional permitió un censo casa a casa.', img: 'suceso',  date: '23 mar · 14:10', author: 'Tane Tanae', slug: 'policia-ninos' },
    { id: 'c2', cat: 'Deportes', catSlug: 'deporte', title: 'Fútbol deltano sueña en grande de cara a los Juegos 2026', excerpt: 'La Sub-17 ya tiene los 20 atletas que defenderán los colores del estado.', img: 'deporte', date: '19 feb · 09:00', author: 'Fredery Marcano', slug: 'futbol-juegos-2026' },
    { id: 'c3', cat: 'Sucesos',  catSlug: 'suceso',  title: 'Vehículo todoterreno se incendia durante el Rusty Trial Extremo', excerpt: 'Kiusmir resultó ileso. Los especialistas dicen que el vehículo es recuperable.', img: 'suceso',  date: '22 mar · 19:22', author: 'Clark Kent', slug: 'incendio-rusty' },
    { id: 'c4', cat: 'Deportes', catSlug: 'deporte', title: 'Delta Amacuro vuelve a ser escenario del taekwondo nacional', excerpt: 'Sábado y domingo, intercambio con federación nacional.', img: 'deporte', date: '21 feb · 12:30', author: 'INDEDA', slug: 'taekwondo-nacional' },
    { id: 'c5', cat: 'Indígena', catSlug: 'indigena', title: 'Autoridades garantizan acceso a salud en comunidades del Bajo Delta', excerpt: 'Jornada médica atiende a más de 300 familias warao en el eje fluvial.', img: 'indigena', date: '20 mar · 08:00', author: 'Tane Tanae', slug: 'salud-bajo-delta' },
    { id: 'c6', cat: 'Deportes', catSlug: 'deporte', title: 'Balonmano y Baloncesto 3×3 femenino clasifican a Juegos Comunales', excerpt: 'El estado aporta dos delegaciones a la fase nacional en Caracas.', img: 'deporte', date: '18 feb · 10:15', author: 'Tane Tanae', slug: 'balonmano-clasifica' },
  ],
  masNoticias: [
    { id: 'mn1', cat: 'Sucesos',  catSlug: 'suceso',            title: "A 'cascazos' le reclamó un presunto hurto y ahora pernocta en el SIP", img: 'suceso',            date: '22 mar', slug: 'cascazos-hurto' },
    { id: 'mn2', cat: 'Deportes', catSlug: 'deporte',           title: 'Carlos Figuera anuncia novedades en la Asociación de Tenis de Mesa', img: 'deporte',           date: '20 mar', slug: 'figuera-tenis' },
    { id: 'mn3', cat: 'Indígena', catSlug: 'indigena',          title: 'Comunidades warao reciben kit escolar para el inicio del año lectivo', img: 'indigena',          date: '18 mar', slug: 'kit-escolar-warao' },
    { id: 'mn4', cat: 'Trinidad', catSlug: 'trinidad-y-tobago', title: 'Delegación deltana participa en feria comercial en Puerto España', img: 'trinidad-y-tobago', date: '16 mar', slug: 'feria-puerto-espana' },
  ],
  fueronNoticias: [
    { id: 'fn1', cat: 'Sucesos',  catSlug: 'suceso',  title: 'Hurtos de ganado vuelven a alarmar al sector pecuario en Antonio Díaz', excerpt: '', img: 'suceso',  date: '10 mar', author: 'Tane Tanae', slug: 'hurtos-ganado' },
    { id: 'fn2', cat: 'Deportes', catSlug: 'deporte', title: 'Loa Tamaronis recibe a la Federación Venezolana de Taekwondo', excerpt: '', img: 'deporte', date: '8 mar',  author: 'Tane Tanae', slug: 'tamaronis-taekwondo' },
    { id: 'fn3', cat: 'Indígena', catSlug: 'indigena', title: 'Comunidades del Bajo Delta participan en foro de lenguas indígenas', excerpt: '', img: 'indigena', date: '5 mar', author: 'Tane Tanae', slug: 'foro-lenguas' },
  ],
  sucesos: [
    { id: 's1', cat: 'Sucesos', catSlug: 'suceso', title: 'Policía Delta Amacuro protege a niños en situación de calle en Tucupita', excerpt: 'Articulación con el gobierno regional permitió un censo casa a casa.', img: 'suceso', date: '23 mar · 14:10', author: 'Tane Tanae', slug: 's1' },
    { id: 's2', cat: 'Sucesos', catSlug: 'suceso', title: 'Ciudadano cae a alcantarilla destapada en el paseo Manamo', excerpt: 'Vecinos exigen a la alcaldía un cronograma de reparación de tapas.', img: 'suceso', date: '23 mar · 11:48', author: 'Tanetanae', slug: 's2' },
    { id: 's3', cat: 'Sucesos', catSlug: 'suceso', title: 'Vehículo todoterreno se incendia durante el Rusty Trial Extremo', excerpt: 'Kiusmir resultó ileso. Los especialistas dicen que el vehículo es recuperable.', img: 'suceso', date: '22 mar · 19:22', author: 'Clark Kent', slug: 's3' },
  ],
  deportes: [
    { id: 'd1', cat: 'Deportes', catSlug: 'deporte', title: 'Fútbol de campo deltano sueña en grande de cara a los Juegos 2026', excerpt: 'La Sub-17 ya tiene los 20 atletas que defenderán los colores del estado.', img: 'deporte', date: '19 feb · 09:00', author: 'Fredery Marcano', slug: 'd1' },
    { id: 'd2', cat: 'Deportes', catSlug: 'deporte', title: 'Delta Amacuro vuelve a ser escenario del taekwondo nacional', excerpt: 'Sábado y domingo, intercambio con federación nacional en Tucupita.', img: 'deporte', date: '21 feb · 12:30', author: 'INDEDA', slug: 'd2' },
    { id: 'd3', cat: 'Deportes', catSlug: 'deporte', title: 'Balonmano y Baloncesto 3×3 femenino clasifican a Juegos Comunales', excerpt: 'El estado aporta dos delegaciones a la fase nacional en Caracas.', img: 'deporte', date: '18 feb · 10:15', author: 'Tane Tanae', slug: 'd3' },
  ],
  indigena: [
    { id: 'i1', cat: 'Indígena', catSlug: 'indigena', title: 'Comunidades warao del Bajo Delta buscan preservar sus tradiciones', excerpt: 'Entre tambores y gaitas, los pueblos indígenas resisten al olvido.', img: 'indigena', date: '15 mar', author: 'Tane Tanae', slug: 'i1' },
    { id: 'i2', cat: 'Indígena', catSlug: 'indigena', title: 'Jornada médica atiende a más de 300 familias warao en el eje fluvial', excerpt: 'Brigadas de salud llegan a las comunidades más remotas del delta.', img: 'indigena', date: '10 mar', author: 'Tane Tanae', slug: 'i2' },
  ],
  trinidad: [
    { id: 'tt1', cat: 'Trinidad y Tobago', catSlug: 'trinidad-y-tobago', title: 'Delegación deltana participa en feria comercial en Puerto España', excerpt: 'Intercambio binacional refuerza lazos económicos con la isla.', img: 'trinidad-y-tobago', date: '16 mar', author: 'Tane Tanae', slug: 'tt1' },
    { id: 'tt2', cat: 'Trinidad y Tobago', catSlug: 'trinidad-y-tobago', title: 'Trinidad y Tobago fortalece vínculos culturales con comunidades del Delta', excerpt: 'Festival binacional reúne a artistas de ambos lados del golfo.', img: 'trinidad-y-tobago', date: '5 mar', author: 'Tane Tanae', slug: 'tt2' },
  ],
  guyana: [
    { id: 'g1', cat: 'Guyana', catSlug: 'guyana', title: 'Esequiba: Venezuela reafirma posición ante la Corte Internacional de Justicia', excerpt: 'La delegación venezolana presentó nuevas pruebas cartográficas en La Haya.', img: 'internacionales', date: '15 may', author: 'Tane Tanae', slug: 'g1' },
    { id: 'g2', cat: 'Guyana', catSlug: 'guyana', title: 'Comunidades del Bajo Delta mantienen intercambio comercial con Georgetown', excerpt: '', img: 'internacionales', date: '8 may', author: 'Tane Tanae', slug: 'g2' },
    { id: 'g3', cat: 'Guyana', catSlug: 'guyana', title: 'Pesca artesanal en la frontera: acuerdo local entre pescadores del río Moruca', excerpt: '', img: 'internacionales', date: '2 may', author: 'Tane Tanae', slug: 'g3' },
  ],
  video: [
    { id: 'v1', cat: 'Video', catSlug: 'video', title: 'EN VIDEO: Gran operativo de nivelación en Tucupita', excerpt: 'Registro completo del recorrido por los 6 sectores de la ciudad.', img: 'video', date: '18 abr', author: 'Alcaldía', slug: 'v1' },
    { id: 'v2', cat: 'Video', catSlug: 'video', title: 'EN VIDEO: Así quedó el Paseo Manamo tras las lluvias', excerpt: 'Las imágenes muestran el nivel de inundación en el centro de Tucupita.', img: 'video', date: '12 abr', author: 'Tane Tanae', slug: 'v2' },
  ],
  mostRead: [
    { id: 'mr1', title: "A 'cascazos' le reclamó un presunto hurto y ahora pernocta en el SIP", cat: 'Sucesos', catSlug: 'suceso', img: 'suceso', slug: 'cascazos-hurto' },
    { id: 'mr2', title: 'Lácteos Delta inicia formalmente sus operaciones tras un mes de pruebas', cat: 'Delta Amacuro', catSlug: null, img: 'recientes', slug: 'lacteos-delta' },
    { id: 'mr3', title: 'Carlos Figuera anuncia novedades en la Asociación de Tenis de Mesa', cat: 'Deportes', catSlug: 'deporte', img: 'deporte', slug: 'figuera-tenis' },
    { id: 'mr4', title: 'Hurtos de ganado vuelven a alarmar al sector pecuario en Antonio Díaz', cat: 'Sucesos', catSlug: 'suceso', img: 'suceso', slug: 'hurtos-ganado' },
    { id: 'mr5', title: 'Loa Tamaronis recibe a la Federación Venezolana de Taekwondo', cat: 'Delta Amacuro', catSlug: null, img: 'recientes', slug: 'tamaronis-taekwondo' },
  ],
  article: {
    id: 'art-1', cat: 'Indígena', catSlug: 'indigena', slug: 'warao-tradiciones',
    title: 'Comunidades warao del Bajo Delta buscan preservar sus tradiciones ancestrales',
    deck: 'Entre tambores y aguinaldos, los pueblos indígenas resisten al olvido.',
    author: 'Tane Tanae', authorRole: 'Redacción · Tane Tanae',
    date: '14 de mayo de 2026', time: '9:42 AM', readTime: '5 min', img: 'indigena',
    body: [
      { type: 'p', lead: true, text: 'Las comunidades warao del Bajo Delta enfrentan el desafío de mantener vivas sus tradiciones en un contexto de modernización acelerada.' },
      { type: 'quote', text: 'Sin lengua no hay pueblo. Y sin pueblo, no hay Delta.', who: 'Líder comunitario, Río Winikina' },
      { type: 'h', text: 'El rol de la escuela intercultural' },
      { type: 'p', text: 'Las escuelas bilingües han sido el principal espacio de transmisión del idioma warao a las nuevas generaciones.' },
    ],
    tags: ['Warao', 'Cultura indígena', 'Bajo Delta'],
  },
  related: [
    { id: 'r1', title: 'Jornada médica atiende a más de 300 familias warao', img: 'indigena', cat: 'Indígena', date: 'Hoy', slug: 'r1' },
    { id: 'r2', title: 'Festival de tradiciones navideñas une a comunidades deltanas', img: 'indigena', cat: 'Indígena', date: 'Ayer', slug: 'r2' },
  ],
};

// ── fetchHome — UN solo request, todos los datos del home ─
// Usa GET /api/home que fetch todo en paralelo del lado del servidor.
// El proxy cachea la respuesta 10 minutos.
export async function fetchHome() {
  try {
    const { data } = await client.get('/home');
    return { ...MOCK_DATA, ...data };
  } catch {
    return MOCK_DATA;
  }
}

// ── Funciones de endpoints individuales ───────────────────

export async function fetchPosts({ page = 1, perPage = 10, category } = {}) {
  try {
    const params = { page, per_page: perPage };
    if (category) params.category = category;
    const { data } = await client.get('/posts', { params });
    return {
      posts: data.posts || [],
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  } catch {
    const fallback = category ? (MOCK_DATA[category] || MOCK_DATA.hero) : MOCK_DATA.hero;
    return { posts: Array.isArray(fallback) ? fallback : [], total: 0, totalPages: 1 };
  }
}

// In-memory prefetch cache — populated on hover, consumed on navigation
const prefetchCache = new Map();

export async function fetchPost(slug) {
  if (prefetchCache.has(slug)) {
    const data = prefetchCache.get(slug);
    prefetchCache.delete(slug);
    return data;
  }
  try {
    const { data } = await client.get(`/posts/slug/${slug}`);
    return data;
  } catch {
    return MOCK_DATA.article;
  }
}

export function prefetchPost(slug) {
  if (!slug || prefetchCache.has(slug)) return;
  client.get(`/posts/slug/${slug}`)
    .then(({ data }) => prefetchCache.set(slug, data))
    .catch(() => {});
}

export async function fetchCategories() {
  try {
    const { data } = await client.get('/categories');
    return data.length ? data : MOCK_DATA.categories;
  } catch {
    return MOCK_DATA.categories;
  }
}

export async function fetchBreaking() {
  try {
    const { data } = await client.get('/breaking');
    return data.items?.length ? data.items : MOCK_DATA.breaking;
  } catch {
    return MOCK_DATA.breaking;
  }
}

export async function fetchHero() {
  try {
    const { data } = await client.get('/hero');
    return data.length ? data : MOCK_DATA.hero;
  } catch {
    return MOCK_DATA.hero;
  }
}

export async function fetchMostRead() {
  try {
    const { data } = await client.get('/most-read');
    return data.length ? data : MOCK_DATA.mostRead;
  } catch {
    return MOCK_DATA.mostRead;
  }
}

// Registra una visita y devuelve el nuevo conteo (o null si falla).
export async function registerView(postId) {
  if (!postId) return null;
  try {
    const { data } = await client.post(`/views/${postId}`);
    return data?.views ?? null;
  } catch {
    return null;
  }
}

export async function fetchTrendingTags() {
  try {
    const { data } = await client.get('/tags/trending');
    return Array.isArray(data) ? data.map(t => t.name) : [];
  } catch {
    return [];
  }
}

export async function searchPosts(query, page = 1) {
  if (!query || query.trim().length < 2) return { results: [], total: 0 };
  try {
    const { data } = await client.get('/search', { params: { q: query.trim(), page } });
    return { results: data.results || [], total: data.total || 0 };
  } catch {
    return { results: [], total: 0 };
  }
}

export async function fetchBanners() {
  try {
    const { data } = await client.get('/banners');
    return data || {};
  } catch {
    return {};
  }
}
