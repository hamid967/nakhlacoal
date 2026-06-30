import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/karla/300.css";
import "@fontsource/karla/400.css";
import "@fontsource/karla/500.css";
import "@fontsource/karla/700.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";

import "./i18n";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./lib/webVitals";

initWebVitals();

// Auto-recover from stale chunk references after a new deploy.
// When index.html points to a chunk hash that no longer exists on the CDN,
// dynamic import() rejects with "Failed to fetch dynamically imported module".
// Reload once to pick up the fresh index.html + new chunk hashes.
const RELOAD_KEY = "__chunk_reload_attempt__";
const handleChunkError = (msg: string) => {
  if (!/dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(msg)) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
};
window.addEventListener("vite:preloadError", (e) => {
  e.preventDefault();
  handleChunkError(String((e as Event & { payload?: Error }).payload?.message ?? "preloadError"));
});
window.addEventListener("error", (e) => handleChunkError(String(e.message ?? "")));
window.addEventListener("unhandledrejection", (e) => handleChunkError(String(e.reason?.message ?? e.reason ?? "")));
// Clear the guard once the app has successfully loaded.
window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_KEY));

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
