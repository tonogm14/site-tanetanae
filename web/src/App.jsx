import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AyerHoyPage from './pages/AyerHoyPage.jsx';
import { trackPageView } from './analytics.js';

function Analytics() {
  const location = useLocation();
  useEffect(() => {
    // rAF deja que la página actualice document.title antes de enviar
    requestAnimationFrame(() => {
      trackPageView(location.pathname + location.search, document.title);
    });
  }, [location.pathname, location.search]);
  return null;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tt-theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('tt-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="tt" data-theme={theme === 'dark' ? 'dark' : undefined}>
      <BrowserRouter>
        <Analytics />
        <Routes>
          <Route path="/"                element={<HomePage     theme={theme} setTheme={toggleTheme} />} />
          <Route path="/buscar"                             element={<SearchPage   theme={theme} setTheme={toggleTheme} />} />
          <Route path="/tanetanae-noticias-de-ayer-y-hoy" element={<AyerHoyPage  theme={theme} setTheme={toggleTheme} />} />
          <Route path="/categoria/:slug"                   element={<CategoryPage theme={theme} setTheme={toggleTheme} />} />
          <Route path="/:slug"                             element={<ArticlePage  theme={theme} setTheme={toggleTheme} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
