/**
 * Google Analytics 4 — inicialización y seguimiento de páginas en SPA.
 * Requiere VITE_GA_ID=G-XXXXXXXXXX en el entorno de build.
 * Si la variable no está definida, todas las funciones son no-op.
 */

const GA_ID = import.meta.env.VITE_GA_ID;

export function initAnalytics() {
  if (!GA_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // send_page_view: false — lo manejamos manualmente en cada cambio de ruta
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(path, title) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path:     path,
    page_title:    title,
    page_location: window.location.origin + path,
  });
}
