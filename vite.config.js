import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // Por si querés mantenerlo de respaldo
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 💡 Si es un módulo grande de node_modules, separalo
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'mui';
            if (id.includes('framer-motion')) return 'motion';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500 // ⚠️ Opcional: sube el warning threshold si querés
  }
});
