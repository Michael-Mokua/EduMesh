import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'assets/mascot.png', 'assets/celebration.png', 'assets/icons.png'],

      manifest: {
        name: 'EduMesh — National Education Platform',
        short_name: 'EduMesh',
        description: 'Offline-first national digital education platform for Kenya. Learn anywhere, anytime.',
        theme_color: '#6366f1',
        background_color: '#f0f4ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['education'],
        icons: [
          { src: '/pwa-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/pwa-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/pwa-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/pwa-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'My Dashboard', short_name: 'Dashboard', url: '/', icons: [{ src: '/pwa-96x96.png', sizes: '96x96' }] },
        ],
      },

      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

        runtimeCaching: [
          // ── Google Fonts — cache-first (never changes) ───────────
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── API — network-first, cache fallback (offline use) ────
          {
            urlPattern: /^http:\/\/localhost:5000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'edumesh-api-cache',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 1 week fallback
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Images / assets — stale-while-revalidate ─────────────
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'edumesh-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Offline fallback ──────────────────────────────────────
          {
            urlPattern: /^http:\/\/localhost:5000\/.*/i,
            handler: 'NetworkOnly',
            options: { cacheName: 'offline-fallback' },
          },
        ],

        // Offline fallback page
        offlineGoogleAnalytics: false,
        navigationPreload: true,
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        // Code split by role for minimal initial bundle
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-db': ['dexie'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
