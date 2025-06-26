// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 👇 Esta línea soluciona tu problema
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000 // 5 MB, ajustalo según lo que necesites
      }
    })
  ]
})
