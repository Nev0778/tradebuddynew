import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/tradebuddynew/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SocialsUnited',
        short_name: 'SocialsUnited',
        description: 'Unified messaging for tradespeople',
        theme_color: '#0B1628',
        background_color: '#0B1628',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/tradebuddynew/',
        icons: [
          { src: '/tradebuddynew/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/tradebuddynew/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
})
