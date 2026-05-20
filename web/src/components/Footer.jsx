import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TTLogo from './TTLogo.jsx';
import Icon from './Icon.jsx';
import { SOCIALS } from '../lib/socials.js';

const SECCIONES = [
  { slug: 'sucesos',          label: 'Sucesos' },
  { slug: 'politica',         label: 'Política' },
  { slug: 'deportes',         label: 'Deportes' },
  { slug: 'tucupita',         label: 'Tucupita' },
  { slug: 'cultura',          label: 'Cultura' },
  { slug: 'salud',            label: 'Salud' },
  { slug: 'sociales',         label: 'Sociales' },
  { slug: 'indigenas',        label: 'Indígenas' },
  { slug: 'trinidad-y-tobago',label: 'Trinidad y Tobago' },
  { slug: 'opinion',          label: 'Opinión' },
];

const WA_URL = import.meta.env.VITE_WHATSAPP_URL || '#';

const SectionTitle = ({ children }) => (
  <h4 style={{
    fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
    color: 'var(--tt-green-vivid)', marginBottom: 14, fontWeight: 600,
  }}>{children}</h4>
);

const WhatsAppCTA = () => (
  <div>
    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 16 }}>
      Resumen diario de noticias directo en tu teléfono. Sin spam.
    </p>
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: '#25D366', color: 'white',
        padding: '12px 20px', borderRadius: 'var(--tt-r-pill)',
        fontWeight: 700, fontSize: 14, textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
      }}
    >
      <Icon name="whatsapp" size={22} />
      Unirse por WhatsApp
    </a>
  </div>
);

const SocialRow = () => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
    {SOCIALS.map(({ name, url }) => (
      <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.18)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.85)',
      }}>
        <Icon name={name} size={14} />
      </a>
    ))}
  </div>
);

const Footer = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <footer style={{ background: '#0E1116', color: 'white', marginTop: 64, paddingBottom: 0 }}>
      <div className="tt-wave" style={{ filter: 'brightness(1.6) saturate(1.4)', opacity: 0.7 }} />
      {isMobile ? <FooterMobile /> : <FooterDesktop />}
    </footer>
  );
};

/* ── Desktop — 4 columnas ── */
const FooterDesktop = () => (
  <>
    <div style={{
      padding: '56px 40px 40px',
      display: 'grid',
      gridTemplateColumns: '1.4fr 1.6fr 1.2fr',
      gap: 48,
      maxWidth: 1440,
      margin: '0 auto',
    }}>
      {/* Logo + about */}
      <div>
        <TTLogo size={28} inverted />
        <p style={{
          fontFamily: 'var(--tt-font-display)', fontStyle: 'italic',
          fontSize: 22, lineHeight: 1.2, marginTop: 20,
          color: 'rgba(255,255,255,0.8)', maxWidth: '22ch',
        }}>
          La voz del Delta. Lo que pasa, así como pasa.
        </p>
        <p style={{
          fontFamily: 'var(--tt-font-sans)', fontSize: 13, lineHeight: 1.6,
          color: 'rgba(255,255,255,0.55)', marginTop: 20, maxWidth: '38ch',
        }}>
          Periodismo independiente desde Tucupita, Delta Amacuro. Cubrimos lo
          que pasa en los nueve municipios del estado desde 2014.
        </p>
      </div>

      {/* Secciones en 2 columnas */}
      <div>
        <SectionTitle>Secciones</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 14 }}>
          {SECCIONES.map(({ slug, label }) => (
            <Link key={slug} to={`/categoria/${slug}`} style={{ color: 'rgba(255,255,255,0.75)' }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* WhatsApp CTA + redes */}
      <div>
        <SectionTitle>Recibe noticias del Delta en tu Whatsapp</SectionTitle>
        <WhatsAppCTA />
        <div style={{ marginTop: 24 }}>
          <SocialRow />
        </div>
      </div>
    </div>

    <FooterBottom padX={40} />
  </>
);

/* ── Mobile — stack vertical ── */
const FooterMobile = () => (
  <>
    <div style={{ padding: '36px 20px 0' }}>
      <TTLogo size={24} inverted />
      <p style={{
        fontFamily: 'var(--tt-font-display)', fontStyle: 'italic',
        fontSize: 18, lineHeight: 1.25, marginTop: 16, marginBottom: 6,
        color: 'rgba(255,255,255,0.8)',
      }}>
        La voz del Delta. Lo que pasa, así como pasa.
      </p>
      <p style={{
        fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)',
        marginBottom: 24,
      }}>
        Periodismo independiente desde Tucupita, Delta Amacuro. Desde 2014.
      </p>

      <div style={{ marginBottom: 28 }}>
        <SocialRow />
      </div>

      {/* WhatsApp */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, marginBottom: 28 }}>
        <SectionTitle>Recibe noticias del Delta en tu Whatsapp</SectionTitle>
        <WhatsAppCTA />
      </div>

      {/* Secciones en 2 columnas */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, marginBottom: 8 }}>
        <SectionTitle>Secciones</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: 14 }}>
          {SECCIONES.map(({ slug, label }) => (
            <Link key={slug} to={`/categoria/${slug}`} style={{ color: 'rgba(255,255,255,0.7)' }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>

    <FooterBottom padX={20} />
  </>
);

/* ── Copyright bar ── */
const FooterBottom = ({ padX }) => (
  <div style={{
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: `16px ${padX}px`,
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.04em',
    textAlign: 'center',
  }}>
    <span>© 2026 Tane Tanae · Así pasó. Todos los derechos reservados.</span>
    <span>Tucupita, Delta Amacuro · Venezuela</span>
  </div>
);

export default Footer;
