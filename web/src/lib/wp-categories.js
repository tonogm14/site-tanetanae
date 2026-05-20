// Categorías de curaduría editorial interna.
// El equipo editorial las usa para organizar las secciones del home,
// pero NO deben aparecer como badges, etiquetas ni enlaces en el frontend.
export const HIDDEN_CAT_SLUGS = new Set([
  'noticias-recientes',   // slug real en WP de la sección "recientes" del hero
  'recientes-b',
  'recientes-c',
  'centrales',
  'central-2',
  'mas-noticias',         // pendiente de crear en WordPress
  'fueron-noticias',      // pendiente de crear en WordPress
  'notificaciones',
  'sin-categoria',
]);

// Nombres de visualización para slugs de categorías de contenido
export const CAT_DISPLAY_NAMES = {
  'sucesos':           'Sucesos',
  'deportes':          'Deportes',
  'indigenas':         'Indígena',
  'trinidad-y-tobago': 'Trinidad y Tobago',
  'videos':            'Video',
  'ultima-hora':       'Última Hora',
};

// Categorías que tienen página pública /categoria/:slug
// (las internas de curaduría no tienen página pública)
export function isPublicCategory(slug) {
  return !HIDDEN_CAT_SLUGS.has(slug);
}
