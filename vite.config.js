import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // 👈 Importante si deployás en GitHub Pages o carpetas
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 'robots.txt',
        'logo192.png', 'logo512.png'
      ],
      manifest: {
        name: 'Eat & Run',
        short_name: 'Eat&Run',
        description: 'Pedidos saludables sin complicaciones.',
        theme_color: '#4caf50',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: true, // Abre el navegador automáticamente
    fs: {
      strict: true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html' // 👈 Siempre usar ruta relativa aquí
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
