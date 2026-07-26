import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
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
    // Service Worker via Workbox — caches static assets, fonts, images, and Supabase Storage
    // for near-instant repeat visits. Auto-updates in the background on new deploys.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,avif,woff2}'],
        navigateFallbackDenylist: [/^\/api/, /^\/admin/, /^\/portal/, /supabase/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'palm-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'palm-fonts',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'palm-storage',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
      manifest: false, // project ships its own public/manifest.webmanifest
    }),
    // Bundle analyzer — writes dist/stats.html on `ANALYZE=1 npm run build`.
    process.env.ANALYZE ? visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }) : null,
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
