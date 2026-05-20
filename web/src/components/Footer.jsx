import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TTLogo from './TTLogo.jsx';
import Icon from './Icon.jsx';

const SECCIONES = [
  { slug: 'sucesos',  label: 'Sucesos' },
  { slug: 'politica', label: 'Política' },
  { slug: 'deportes', label: 'Deportes' },
  { slug: 'tucupita', label: 'Tucupita' },
  { slug: 'cultura',  label: 'Cultura' },
  { slug: 'salud',    label: 'Salud' },
  { slug: 'sociales', label: 'Sociales' },
];

const LINKS = ['Sobre nosotros', 'Equipo editorial', 'Política de privacidad', 'Anuncia con nosotros', 'Contacto'];

const SOCIALS = ['facebook', 'instagram', 'whatsapp', 'youtube', 'twitter'];

const SectionTitle = ({ children }) => (
  <h4 style={{
    fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
    color: 'var(--tt-green-vivid)', marginBottom: 14, fontWeight: 600,
  }}>{children}</h4>
);

const WhatsAppForm = () => (
  <div>
    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 12 }}>
      Resumen diario por WhatsApp a las 7:00 AM. Sin spam.
    </p>
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 'var(--tt-r-pill)',
      padding: 4,
    }}>
      <input
        placeholder="Tu número de WhatsApp"
        style={{
          flex: 1, background: 'transparent', border: 0,
          color: 'white', padding: '8px 12px', fontSize: 13,
          fontFamily: 'var(--tt-font-sans)', outline: 'none',
          minWidth: 0,
        }}
      />
      <button style={{
        background: 'var(--tt-green-vivid)', color: 'var(--tt-ink)',
        padding: '8px 14px', borderRadius: 'var(--tt-r-pill)',
        fontWeight: 600, fontSize: 12, letterSpacing: '0.04em',
        border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>Suscribir</button>
    </div>
  </div>
);

const SocialRow = () => (
  <div style={{ display: 'flex', gap: 10 }}>
    {SOCIALS.map(n => (
      <a key={n} href="#" style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.18)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.85)',
      }}>
        <Icon name={n} size={14} />
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

/* ── Desktop — 4 columnas original ── */
const FooterDesktop = () => (
  <>
    <div style={{
      padding: '56px 40px 40px',
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
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

      {/* Secciones */}
      <div>
        <SectionTitle>Secciones</SectionTitle>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
          {SECCIONES.map(({ slug, label }) => (
            <li key={slug}>
              <Link to={`/categoria/${slug}`} style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Institucional */}
      <div>
        <SectionTitle>Tane Tanae</SectionTitle>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
          {LINKS.map(l => (
            <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.75)' }}>{l}</a></li>
          ))}
        </ul>
      </div>

      {/* WhatsApp + redes */}
      <div>
        <SectionTitle>Recibe el delta en tu día</SectionTitle>
        <WhatsAppForm />
        <div style={{ marginTop: 22 }}>
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
      {/* Logo */}
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

      {/* Redes sociales */}
      <div style={{ marginBottom: 28 }}>
        <SocialRow />
      </div>

      {/* WhatsApp */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 24, marginBottom: 28,
      }}>
        <SectionTitle>Recibe el delta en tu día</SectionTitle>
        <WhatsAppForm />
      </div>

      {/* Secciones + Links en 2 columnas */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 24, marginBottom: 8,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
      }}>
        <div>
          <SectionTitle>Secciones</SectionTitle>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            {SECCIONES.map(({ slug, label }) => (
              <li key={slug}>
                <Link to={`/categoria/${slug}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionTitle>Tane Tanae</SectionTitle>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            {LINKS.map(l => (
              <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <FooterBottom padX={20} />
  </>
);

/* ── Copyright bar (compartida) ── */
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
