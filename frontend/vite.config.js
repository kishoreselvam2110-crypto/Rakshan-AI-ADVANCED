import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'offline.html'],
      manifest: {
        name: 'Rakshan AI',
        short_name: 'Rakshan',
        description: 'AI-Driven Safety Platform for Tourists',
        theme_color: '#050505',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/wilderness-aid'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'first-aid-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('cartocdn.com') || url.hostname.includes('openstreetmap.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-tiles-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('overpass-api.de') || url.hostname.includes('project-osrm.org'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'gis-overpass-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/api/offline-kit') || url.pathname.includes('/api/safety-score') || url.pathname.includes('/api/zones'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'shield-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 3
            }
          }
        ],
      }
    })
  ],
  optimizeDeps: {
    include: ['react-qr-reader']
  },
  ssr: {
    noExternal: ['react-qr-reader']
  }
})
