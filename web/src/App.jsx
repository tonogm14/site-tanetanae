import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AyerHoyPage from './pages/AyerHoyPage.jsx';

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
