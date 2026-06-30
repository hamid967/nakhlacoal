import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";
import { lcpPreload } from "./vite-plugins/lcp-preload";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has("picture")) {
          return new URLSearchParams({
            format: "avif;webp;jpg",
            w: "640;960;1280;1600",
            as: "picture",
          });
        }
        return new URLSearchParams();
      },
    }),
    // Inject <link rel="preload" fetchpriority="high"> for the most likely LCP image
    lcpPreload({ candidates: ['slide-coconut-trees', 'product-coconut', 'hero-charcoal'] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'cursor-logo.png', 'cursor-lux.png', 'robots.txt'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,avif,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/admin/, /^\/portal/, /^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'فحم النخلة | Palm Charcoal',
        short_name: 'Palm Charcoal',
        description: 'Premium Saudi coconut charcoal — فحم جوز الهند الفاخر',
        theme_color: '#0b3d2e',
        background_color: '#f7f3ea',
        display: 'standalone',
        start_url: '/',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three';
          if (/[\\/]node_modules[\\/](recharts|recharts-scale|react-smooth|victory-vendor|d3-[^/]+|lodash|eventemitter3|tiny-invariant|react-is)[\\/]/.test(id)) return 'charts';
          if (/[\\/]node_modules[\\/]swiper[\\/]/.test(id)) return 'swiper';
          if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) return 'supabase';
          if (/[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/.test(id)) return 'i18n';
          if (/[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/.test(id)) return 'forms';
          // Do NOT split react/react-dom into a separate chunk; doing so
          // creates TDZ "Cannot access 'P' before initialization" errors
          // when other vendor chunks (recharts, etc.) reference React at
          // module-evaluation time before the react chunk is initialized.
        },
      },
    },
  },
}));
