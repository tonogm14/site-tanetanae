/**
 * Filtro de palabras obscenas — venezolano-español.
 *
 * Palabras adicionales: variable de entorno PROFANITY_EXTRA (separadas por coma).
 *   PROFANITY_EXTRA=groser,otravez,nuevapalabra
 */

const BASE_WORDS = [
  // ── mierda y derivados ───────────────────────────────────
  'mierda', 'mierdas', 'mierd', 'mrd',
  'comemierda', 'comemierdas',

  // ── puta / puto ──────────────────────────────────────────
  'puta', 'putas', 'puto', 'putos',
  'putona', 'puton', 'putazo', 'putazos',
  'putería', 'puteria',
  'hijueputa', 'hijueputas', 'hijoputa', 'joputas',
  'hdp', 'ptm',

  // ── coño ─────────────────────────────────────────────────
  'coño', 'coños', 'cono', 'conos',
  'coñazo', 'coñazos',
  'coñoesumadre', 'ctm',

  // ── pendejo ───────────────────────────────────────────────
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'pendejada', 'pendejadas', 'pendejez',

  // ── marico / marica ───────────────────────────────────────
  'marico', 'marica', 'maricos', 'maricas',
  'maricon', 'maricón', 'maricones', 'mariquera', 'mariqueras',

  // ── verga ─────────────────────────────────────────────────
  'verga', 'vergas', 'vergajo', 'vergajazos',
  'vergon', 'vergona',

  // ── cabrón ────────────────────────────────────────────────
  'cabron', 'cabrón', 'cabrona', 'cabrones', 'cabronas', 'cabronazo',

  // ── culo / culero ─────────────────────────────────────────
  'culo', 'culos', 'culazo', 'culazos',
  'culero', 'culera', 'culeros', 'culeras',

  // ── carajo ────────────────────────────────────────────────
  'carajo', 'carajos', 'carajada',

  // ── joder ────────────────────────────────────────────────
  'joder', 'jodido', 'jodida', 'jodidos', 'jodidas',
  'jodete', 'jódete',

  // ── zorra / perra ────────────────────────────────────────
  'zorra', 'zorras', 'perra', 'perras', 'perrazo',

  // ── mamaguevo / mamahuevo ────────────────────────────────
  'mamaguevo', 'mamaguevos', 'mamaguebo', 'mamagueba',
  'mamahuevo', 'mamahuevos',

  // ── guevo / güevo ────────────────────────────────────────
  'guevo', 'gueva', 'güevo', 'güeva',
  'guevon', 'güevon', 'guevazo',

  // ── pajuo ────────────────────────────────────────────────
  'pajuo', 'pajua', 'pajuos', 'pajuas',

  // ── malparido ────────────────────────────────────────────
  'malparido', 'malparida', 'malparidos', 'malparidas',

  // ── arrecho ──────────────────────────────────────────────
  'arrecho', 'arrecha', 'arrechos', 'arrechas', 'arrechazon',

  // ── chimbo / chimba ──────────────────────────────────────
  'chimbo', 'chimba', 'chimbos', 'chimbas',

  // ── chuchumeco ───────────────────────────────────────────
  'chuchumeco', 'chuchumeca', 'chuchumecos',

  // ── gonorrea ─────────────────────────────────────────────
  'gonorrea', 'gonorre',

  // ── conchudo ────────────────────────────────────────────
  'conchudo', 'conchuda', 'conchudos', 'conchudas',

  // ── cojones ─────────────────────────────────────────────
  'cojon', 'cojones', 'cojonudo', 'cojonuda',

  // ── bastardo ─────────────────────────────────────────────
  'bastardo', 'bastarda', 'bastardos', 'bastardas',

  // ── desgraciado ──────────────────────────────────────────
  'desgraciado', 'desgraciada', 'desgraciados', 'desgraciadas',

  // ── sinvergüenza ─────────────────────────────────────────
  'sinverguenza', 'sinvergüenza', 'sinverguenzas',

  // ── nojoda ───────────────────────────────────────────────
  'nojoda', 'nojodas',

  // ── carepalo ─────────────────────────────────────────────
  'carepalo',

  // ── mamada ───────────────────────────────────────────────
  'mamada', 'mamadas',

  // ── lambuquero / lambucio ────────────────────────────────
  'lambuquero', 'lambuquera', 'lambucio', 'lambucia',

  // ── idiota / imbécil / estúpido ──────────────────────────
  'idiota', 'idiotas',
  'imbecil', 'imbeciles', 'imbécil', 'imbéciles',
  'estupido', 'estupida', 'estupidos', 'estupidas',
  'estúpido', 'estúpida',

  // ── tierruo (venezolano) ─────────────────────────────────
  'tierruo', 'tierrua', 'tierruos',

  // ── chinga ───────────────────────────────────────────────
  'chinga', 'chingada', 'chingado',

  // ── maldito ──────────────────────────────────────────────
  'maldito', 'maldita', 'malditos', 'malditas',

  // ── puñeta ───────────────────────────────────────────────
  'puñeta', 'puñetas',
];

// Palabras extra desde entorno — PROFANITY_EXTRA=word1,word2,...
const extraRaw = (process.env.PROFANITY_EXTRA || '').split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
const ALL_WORDS = [...new Set([...BASE_WORDS, ...extraRaw])];

// Ordenar de mayor a menor longitud para que compuestos se resuelvan primero
ALL_WORDS.sort((a, b) => b.length - a.length);

function esc(w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Límite de palabra que reconoce letras españolas (évita falsos positivos como
// "culo" dentro de "artículo")
const L = '[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]';
const PROFANITY_RE = new RegExp(
  `(?<!${L})(${ALL_WORDS.map(esc).join('|')})(?!${L})`,
  'gi'
);

/**
 * Reemplaza palabras obscenas por "****".
 * Se aplica en servidor antes de guardar en DB.
 */
function censorText(text) {
  if (!text) return text;
  return text.replace(PROFANITY_RE, '****');
}

module.exports = { censorText };
