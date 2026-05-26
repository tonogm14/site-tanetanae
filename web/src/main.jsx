import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initAnalytics } from './analytics.js';

initAnalytics();

const faviconUrl = import.meta.env.VITE_FAVICON_URL;
if (faviconUrl && faviconUrl.trim()) {
  const link = document.querySelector("link[rel='icon']");
  if (link) link.href = faviconUrl.trim();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
