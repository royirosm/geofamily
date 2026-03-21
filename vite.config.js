// vite.config.js
// Phase 3: vite-plugin-pwa added for PWA support.
// The plugin auto-generates the Service Worker and handles cache-busting on deploy.
// Run: npm install -D vite-plugin-pwa   (one-time setup)

import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import { VitePWA }      from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // 'autoUpdate' silently updates the SW in the background.
      // The user never sees a "new version available" prompt — they
      // just get the latest version on their next page load.
      registerType: 'autoUpdate',

      // Pre-cache all Vite build output (JS, CSS, HTML).
      // The plugin calculates this automatically from the build manifest.
      includeAssets: ['favicon.svg', 'icons/*.png'],

      manifest: false, // We manage manifest.json ourselves in /public

      workbox: {
        // The SW pre-caches all JS/CSS/HTML built by Vite.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],

        // Runtime caching rules — applied to requests NOT in the pre-cache.
        runtimeCaching: [
          {
            // RestCountries API — network first, fall back to cache.
            // This means: try to get fresh data, but if offline use
            // whatever we have stored. Complements the 24h localStorage cache.
            urlPattern: /^https:\/\/restcountries\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'restcountries-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            // Flag SVGs from RestCountries CDN — cache on demand (StaleWhileRevalidate).
            // First request: fetch from network AND add to cache.
            // Subsequent requests: serve from cache instantly, update in background.
            // Works even if a flag was only ever loaded once — it will be cached.
            urlPattern: /^https:\/\/flagcdn\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'flags-cache',
              expiration: {
                maxEntries: 250, // covers all ~195 countries with room to spare
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
})
