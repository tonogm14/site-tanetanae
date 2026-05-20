/**
 * Tane Tanae design tokens — React Native equivalents of the CSS variables.
 * All colors, typography, spacing, and radius values from styles.css.
 */

export const colors = {
  // Brand greens
  green:       '#0E7A3F',   // --tt-green: deep delta green
  greenDeep:   '#0A5C2F',   // --tt-green-deep: hover/pressed
  greenVivid:  '#25C26B',   // --tt-green-vivid: accent highlights
  greenSoft:   '#E6F4EB',   // --tt-green-soft: tint surface
  greenLine:   '#C5E1CE',   // --tt-green-line: tint border

  // Neutrals
  ink:         '#0E1116',   // --tt-ink
  ink2:        '#1A1F25',   // --tt-ink-2
  inkMuted:    '#4A525C',   // --tt-ink-muted
  inkFaint:    '#8B939D',   // --tt-ink-faint
  line:        '#E4E4DC',   // --tt-line
  lineStrong:  '#C9C9BE',   // --tt-line-strong

  paper:       '#FAF9F5',   // --tt-paper: warm off-white
  paper2:      '#F2F1EA',   // --tt-paper-2: sectioned bg
  white:       '#FFFFFF',   // --tt-white

  // Semantic
  breaking:    '#E5392F',   // --tt-breaking: breaking news red
  warn:        '#E89D2A',   // --tt-warn
  info:        '#2A6FDB',   // --tt-info

  // Category image tones (for gradient backgrounds)
  catSucesos:  { from: '#4a3027', mid: '#8a4f3e', to: '#c48168' },
  catDeportes: { from: '#0f3a1f', mid: '#1c6b3a', to: '#3fa867' },
  catPolitica: { from: '#1a2538', mid: '#34466b', to: '#6481b3' },
  catTucupita: { from: '#6b4a1e', mid: '#b1832e', to: '#e0bd5a' },
  catCultura:  { from: '#561e3e', mid: '#993569', to: '#cf6f9d' },
  catSalud:    { from: '#163d4c', mid: '#2c7693', to: '#5aafce' },
  catSociales: { from: '#4b3a16', mid: '#8f7028', to: '#c5a85c' },
  catBreaking: { from: '#2a0606', mid: '#7a1810', to: '#c63d2e' },
};

export const catColors = {
  sucesos:  colors.catSucesos,
  deportes: colors.catDeportes,
  politica: colors.catPolitica,
  tucupita: colors.catTucupita,
  cultura:  colors.catCultura,
  salud:    colors.catSalud,
  sociales: colors.catSociales,
  breaking: colors.catBreaking,
};

// For LinearGradient start/end colors by slug
export function getCatGradient(slug) {
  const c = catColors[slug] || catColors.politica;
  return [c.from, c.mid, c.to];
}

export const fonts = {
  display: 'Georgia', // closest available system serif to Instrument Serif
  serif:   'Georgia',
  sans:    'System',  // system-ui equivalent on RN
};

export const fontSizes = {
  xs:   9,
  sm:   11,
  base: 13,
  md:   15,
  lg:   17,
  xl:   22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 38,
};

export const radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lift: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};

// Dark mode overrides
export const darkColors = {
  paper:      '#0B0E13',
  paper2:     '#141921',
  ink:        '#F5F4EE',
  ink2:       '#E7E5DC',
  inkMuted:   '#B5BBC4',
  inkFaint:   '#767D87',
  line:       '#232830',
  lineStrong: '#2E3540',
  white:      '#161B22',
  green:      '#25C26B',
  greenSoft:  '#0F2A1B',
  greenLine:  '#1F4A2E',
};
