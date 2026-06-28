// Lightweight analytics wrapper: GA4 + Facebook Pixel
// Configure IDs via .env: VITE_GA4_ID, VITE_FB_PIXEL_ID

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // ---- GA4 ----
  if (GA4_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { anonymize_ip: true });
  }

  // ---- Facebook Pixel ----
  if (FB_PIXEL_ID) {
    (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq!("init", FB_PIXEL_ID);
    window.fbq!("track", "PageView");
  }
}

export function trackPageView(path: string) {
  if (GA4_ID && window.gtag) window.gtag("config", GA4_ID, { page_path: path });
  if (FB_PIXEL_ID && window.fbq) window.fbq("track", "PageView");
}

export function trackEvent(name: string, params: Record<string, any> = {}) {
  if (window.gtag) window.gtag("event", name, params);
  if (window.fbq) window.fbq("trackCustom", name, params);
}
