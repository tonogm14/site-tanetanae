import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,           // escucha en todas las interfaces (necesario para ngrok)
    allowedHosts: true,   // permite dominios ngrok (*.ngrok-free.app, *.ngrok.io)
    hmr: {
      clientPort: 443,    // ngrok usa HTTPS en 443; el cliente conecta en este puerto
    },
    proxy: {
      // /api/* → Express en localhost:3002 (resuelve CORS con WordPress)
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
