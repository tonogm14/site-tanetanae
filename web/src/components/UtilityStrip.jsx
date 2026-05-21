import React, { useState, useEffect } from 'react';
import Icon from './Icon.jsx';

// Tucupita, Delta Amacuro
const LAT = 9.0625;
const LON = -62.0571;
const CACHE_KEY = 'tt_weather_v1';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

function wmoIcon(code) {
  if (code === 0)                        return '☀';
  if (code <= 2)                         return '🌤';
  if (code === 3)                        return '☁';
  if (code <= 48)                        return '🌫';
  if (code <= 57)                        return '🌦';
  if (code <= 67)                        return '🌧';
  if (code <= 77)                        return '🌨';
  if (code <= 82)                        return '🌧';
  if (code <= 86)                        return '❄';
  return '⛈';
}

function loadCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

const UtilityStrip = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const [weather, setWeather] = useState(loadCached());

  useEffect(() => {
    if (loadCached()) return; // still fresh
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,apparent_temperature,weather_code&timezone=America%2FCaracas`
    )
      .then(r => r.json())
      .then(json => {
        const c = json.current;
        const data = {
          temp: Math.round(c.temperature_2m),
          feels: Math.round(c.apparent_temperature),
          icon: wmoIcon(c.weather_code),
        };
        saveCache(data);
        setWeather(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      background: 'var(--tt-paper-2)',
      borderBottom: '1px solid var(--tt-line)',
      fontFamily: 'var(--tt-font-sans)',
      fontSize: 11,
      color: 'var(--tt-ink-muted)',
      height: 30,
      letterSpacing: '0.03em',
    }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="location" size={12} stroke={1.8} />
        <strong style={{ color: 'var(--tt-ink)' }}>Tucupita</strong>
        <span style={{ color: 'var(--tt-ink-faint)' }}>· Delta Amacuro</span>
      </span>
      <span style={{ marginInline: 12, color: 'var(--tt-line-strong)' }}>|</span>
      <span>{dateStr}</span>
      <span style={{ marginInline: 12, color: 'var(--tt-line-strong)' }}>|</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {weather
          ? `${weather.icon} ${weather.temp}° · sensación ${weather.feels}°`
          : '— °C'
        }
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--tt-breaking)' }}>
          <Icon name="radio" size={12} stroke={1.8} /> En vivo
        </span>
        <span>Radio Fe y Alegría 92.1 FM</span>
      </span>
    </div>
    </div>
  );
};

export default UtilityStrip;
