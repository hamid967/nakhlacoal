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
          if (/[\\/]node_modules[\\/]recharts[\\/]/.test(id)) return 'charts';
          if (/[\\/]node_modules[\\/]swiper[\\/]/.test(id)) return 'swiper';
          if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) return 'supabase';
          if (/[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/.test(id)) return 'i18n';
          if (/[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/.test(id)) return 'forms';
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react-vendor';
        },
      },
    },
  },
}));
