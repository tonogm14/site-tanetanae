import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UtilityStrip from '../components/UtilityStrip.jsx';
import BreakingBar from '../components/BreakingBar.jsx';
import Header from '../components/Header.jsx';
import HeaderMobile from '../components/HeaderMobile.jsx';
import SeccionNoticias from '../components/SeccionNoticias.jsx';
import StoryRow from '../components/StoryRow.jsx';
import StoryCard from '../components/StoryCard.jsx';
import SectionHead from '../components/SectionHead.jsx';
import MostReadBox from '../components/MostReadBox.jsx';
import WhatsappBox from '../components/WhatsappBox.jsx';
import CategoriesBox from '../components/CategoriesBox.jsx';
import Footer from '../components/Footer.jsx';
import {
  SucesosBlock, DeportesBlock,
  PueblosDelDeltaBlock, InternacionalFronteraBlock,
  SucesosMobile, DeportesMobile,
  PueblosDelDeltaMobile, InternacionalFronteraMobile,
  MasNoticiasMobile, FueronNoticiasMobile, VideosMobile,
} from '../components/SectionBlocks.jsx';
import { fetchHome, fetchBanners, fetchOtherPosts, MOCK_DATA } from '../api/wordpress.js';
import BannerSlot from '../components/BannerSlot.jsx';

// ── Layout de escritorio ───────────────────────────────────
const HomeDesktop = ({ data, loading, theme, setTheme, banners, otherPosts }) => {

  return (
    <div style={{ background: 'var(--tt-paper)' }}>
      <UtilityStrip />
      <BreakingBar items={data.breaking} />
      <Header theme={theme} setTheme={setTheme} />

      {/* Hero mosaico */}
      <section style={{ padding: '32px 40px 0', maxWidth: 1440, margin: '0 auto' }}>
        <SeccionNoticias
          posts={data.hero}
          loading={loading}
          titulo={null}
          variant="hero"
          showHead={false}
        />
      </section>

      {/* Banner hero */}
      <section style={{ padding: '0 40px', maxWidth: 1440, margin: '0 auto' }}>
        <BannerSlot banner={banners['hero']} />
      </section>

      {/* Más Noticias — las 3 primeras notas de Centrales */}
      {(data.masNoticias || []).length > 0 && (
        <section style={{ padding: '40px 40px 0', maxWidth: 1440, margin: '0 auto' }}>
          <SectionHead title="Más Noticias" italic="del día" verTodas={false} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
            {data.masNoticias.slice(0, 3).map(s => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      )}

      {/* Banner mas-noticias */}
      <section style={{ padding: '0 40px', maxWidth: 1440, margin: '0 auto' }}>
        <BannerSlot banner={banners['mas-noticias']} />
      </section>

      {/* Layout principal: columna central + sidebar */}
      <section style={{
        padding: '40px 40px 0',
        maxWidth: 1440, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 320px', gap: 56,
        alignItems: 'start',
      }}>
        {/* ── Columna central ── */}
        <div>
          <SucesosBlock posts={data.sucesos} loading={loading} />
          <DeportesBlock posts={data.deportes} loading={loading} />

          {/* Banner sucesos-deportes */}
          <BannerSlot banner={banners['sucesos-deportes']} />

          {/* Fueron Noticias — fila de 3 tarjetas */}
          {(data.fueronNoticias || []).length > 0 && (
            <div style={{ marginTop: 56 }}>
              <SectionHead title="Fueron Noticias" verTodas={false} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
                {data.fueronNoticias.slice(0, 3).map(s => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </div>
          )}

          {/* Banner fueron-noticias */}
          <BannerSlot banner={banners['fueron-noticias']} />
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <BannerSlot banner={banners['home-sidebar-top']} />
          <MostReadBox stories={otherPosts} />

          <SeccionNoticias
            posts={data.video}
            loading={loading}
            titulo="Video"
            variant="compact"
            categoria="videos"
          />
          <BannerSlot banner={banners['videos']} />

          <WhatsappBox />
          <CategoriesBox cats={data.categories} />
          <BannerSlot banner={banners['home-sidebar-bottom']} />
        </aside>
      </section>

      {/* ── Secciones full-width (fuera del sidebar) ── */}

      {/* Pueblos del Delta */}
      <section style={{ padding: '0 40px', maxWidth: 1440, margin: '0 auto' }}>
        <PueblosDelDeltaBlock posts={data.indigena} loading={loading} />
      </section>

      {/* Banner indigena */}
      <section style={{ padding: '0 40px', maxWidth: 1440, margin: '0 auto' }}>
        <BannerSlot banner={banners['indigena']} />
      </section>

      {/* Internacional Frontera */}
      <section style={{ padding: '0 40px', maxWidth: 1440, margin: '0 auto' }}>
        <InternacionalFronteraBlock
          trinidadPosts={data.trinidad}
          guyanaPosts={data.guyana}
          loading={loading}
        />
      </section>

      {/* Banner internacional */}
      <section style={{ padding: '0 40px', maxWidth: 1440, margin: '0 auto' }}>
        <BannerSlot banner={banners['internacional']} />
      </section>

      <Footer />
    </div>
  );
};

// ── Layout móvil ───────────────────────────────────────────
const HomeMobile = ({ data, loading, theme, setTheme, banners, otherPosts }) => {
  const [hi, setHi]           = useState(0);
  const touchX                = useRef(null);
  const pauseRef              = useRef(false);
  const navigate              = useNavigate();

  useEffect(() => {
    document.title = 'Tanetanae · La voz del Delta';
  }, []);

  useEffect(() => {
    if (data.hero.length <= 1) return;
    const id = setInterval(() => {
      if (!pauseRef.current) setHi(v => (v + 1) % data.hero.length);
    }, 6000);
    return () => clearInterval(id);
  }, [data.hero.length]);

  const hero = data.hero[hi] || {};

  const handleTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    pauseRef.current = true;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
    touchX.current = null;
    setTimeout(() => { pauseRef.current = false; }, 4000);
    if (Math.abs(dx) > 50) {
      // Swipe — change slide
      setHi(v => dx < 0
        ? (v + 1) % data.hero.length
        : (v - 1 + data.hero.length) % data.hero.length);
    } else if (Math.abs(dx) < 8 && hero.slug) {
      // Tap — navigate
      navigate(`/${hero.slug}`);
    }
  };

  return (
    <div style={{ background: 'var(--tt-paper)' }}>
      <BreakingBar items={data.breaking} />
      <HeaderMobile theme={theme} setTheme={setTheme} />

      {/* Hero card rotativo */}
      <section style={{ padding: 16 }}>
        <div style={{ position: 'relative' }}>
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'relative', height: 420, borderRadius: 'var(--tt-r-lg)', overflow: 'hidden', background: 'var(--tt-ink)', color: 'white', cursor: 'pointer' }}
          >
            {hero.imgUrl
              ? <img src={hero.imgUrl} alt={hero.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div className={`tt-img tt-img--${hero.img || 'recientes'}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: 20 }}>
              {hero.cat && <span className="tt-chip" style={{ marginBottom: 10, display: 'inline-flex' }}>{hero.cat}</span>}
              <h2 className="tt-headline" style={{ color: 'white', fontSize: 30, marginBottom: 10 }}>{hero.title}</h2>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                <span>{hero.author}</span><span>·</span><span>{hero.date}</span>
              </div>
            </div>
          </div>
          {/* Dots — fuera del área de navegación */}
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4, zIndex: 5 }}>
            {data.hero.map((_, idx) => (
              <button key={idx} onClick={() => setHi(idx)} style={{
                width: idx === hi ? 18 : 6, height: 4, borderRadius: 999, padding: 0, border: 'none',
                background: idx === hi ? 'var(--tt-green-vivid)' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.25s', cursor: 'pointer',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner hero — mobile */}
      <BannerSlot banner={banners['hero']} style={{ margin: '16px 0', padding: '0 16px' }} />

      {/* Sub-hero */}
      <section style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column' }}>
        {data.hero.slice(1, 3).map(s => (
          <Link key={s.id} to={s.slug ? `/${s.slug}` : '/'} style={{
            display: 'grid', gridTemplateColumns: '1fr 110px', gap: 14,
            paddingBlock: 14, borderBottom: '1px solid var(--tt-line)', textDecoration: 'none',
          }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tt-green)' }}>{s.cat}</span>
                <span style={{ fontSize: 11, color: 'var(--tt-ink-faint)' }}>{s.date}</span>
              </div>
              <h3 className="tt-headline" style={{ fontSize: 18, lineHeight: 1.15 }}>{s.title}</h3>
            </div>
            <div style={{ borderRadius: 8, overflow: 'hidden' }}>
              {s.imgUrl
                ? <img src={s.imgUrl} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                : <div className={`tt-img tt-img--${s.img || 'recientes'} tt-aspect-1x1`} style={{ width: '100%' }} />
              }
            </div>
          </Link>
        ))}
      </section>

      {/* Más Noticias — mobile */}
      <section style={{ padding: '8px 16px' }}>
        <MasNoticiasMobile posts={data.masNoticias || []} loading={loading} />
      </section>

      {/* Banner mas-noticias — mobile */}
      <BannerSlot banner={banners['mas-noticias']} style={{ margin: '16px 0', padding: '0 16px' }} />

      {/* Sucesos */}
      <section style={{ padding: '8px 16px' }}>
        <SucesosMobile posts={data.sucesos} loading={loading} />
      </section>

      {/* Deportes */}
      <section style={{ padding: '8px 16px' }}>
        <DeportesMobile posts={data.deportes} loading={loading} />
      </section>

      {/* Banner sucesos-deportes — mobile */}
      <BannerSlot banner={banners['sucesos-deportes']} style={{ margin: '16px 0', padding: '0 16px' }} />

      {/* Fueron Noticias — mobile */}
      <section style={{ padding: '8px 16px' }}>
        <FueronNoticiasMobile posts={data.fueronNoticias || []} loading={loading} />
      </section>

      {/* Banner fueron-noticias — mobile */}
      <BannerSlot banner={banners['fueron-noticias']} style={{ margin: '16px 0', padding: '0 16px' }} />

      <section style={{ padding: '32px 16px 8px' }}>
        <MostReadBox stories={otherPosts.slice(0, 4)} />
      </section>

      {/* Pueblos del Delta */}
      <section style={{ padding: '8px 16px' }}>
        <PueblosDelDeltaMobile posts={data.indigena} loading={loading} />
      </section>

      {/* Banner indigena — mobile */}
      <BannerSlot banner={banners['indigena']} style={{ margin: '16px 0', padding: '0 16px' }} />

      {/* Internacional Frontera */}
      <section style={{ padding: '8px 16px' }}>
        <InternacionalFronteraMobile
          trinidadPosts={data.trinidad}
          guyanaPosts={data.guyana}
          loading={loading}
        />
      </section>

      {/* Banner internacional — mobile */}
      <BannerSlot banner={banners['internacional']} style={{ margin: '16px 0', padding: '0 16px' }} />

      {/* Video */}
      <section style={{ padding: '8px 16px' }}>
        <VideosMobile posts={data.video} loading={loading} />
      </section>

      {/* Banner videos — mobile */}
      <BannerSlot banner={banners['videos']} style={{ margin: '16px 0', padding: '0 16px' }} />

      <section style={{ padding: '8px 16px 24px' }}>
        <WhatsappBox />
      </section>

      <section style={{ padding: '0 16px 32px' }}>
        <CategoriesBox cats={data.categories} />
      </section>

      <Footer />
    </div>
  );
};

// ── Página principal ───────────────────────────────────────
export default function HomePage({ theme, setTheme }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [data, setData] = useState({
    breaking:       MOCK_DATA.breaking,
    hero:           [],
    centrales:      [],
    masNoticias:    [],
    fueronNoticias: [],
    sucesos:        [],
    deportes:       [],
    indigena:       [],
    trinidad:       [],
    guyana:         [],
    video:          [],
    mostRead:       [],
    categories:     MOCK_DATA.categories,
  });
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState({});
  const [otherPosts, setOtherPosts] = useState([]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchHome().then(homeData => {
      if (!cancelled) {
        setData(prev => ({ ...prev, ...homeData }));
        setLoading(false);
      }
    });
    fetchBanners().then(setBanners);
    fetchOtherPosts().then(p => { if (!cancelled) setOtherPosts(p); });
    return () => { cancelled = true; };
  }, []);

  return isMobile
    ? <HomeMobile data={data} loading={loading} theme={theme} setTheme={setTheme} banners={banners} otherPosts={otherPosts} />
    : <HomeDesktop data={data} loading={loading} theme={theme} setTheme={setTheme} banners={banners} otherPosts={otherPosts} />;
}
