// Redes sociales configuradas desde variables de entorno.
// Si la URL no está definida, el ícono no aparece.
const ALL_SOCIALS = [
  { name: 'whatsapp',  url: import.meta.env.VITE_WHATSAPP_URL  },
  { name: 'facebook',  url: import.meta.env.VITE_FACEBOOK_URL  },
  { name: 'instagram', url: import.meta.env.VITE_INSTAGRAM_URL },
  { name: 'youtube',   url: import.meta.env.VITE_YOUTUBE_URL   },
  { name: 'twitter',   url: import.meta.env.VITE_TWITTER_URL   },
];

export const SOCIALS = ALL_SOCIALS.filter(s => s.url && s.url.trim() !== '');
