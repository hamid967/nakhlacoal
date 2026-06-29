import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const SCRIPT_ID = 'recaptcha-v3-script';

function loadScript(): Promise<void> {
  if (!SITE_KEY) return Promise.reject(new Error('Missing VITE_RECAPTCHA_SITE_KEY'));
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.grecaptcha) return Promise.resolve();
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((res, rej) => {
      existing.addEventListener('load', () => res(), { once: true });
      existing.addEventListener('error', () => rej(new Error('recaptcha load failed')), { once: true });
    });
  }
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.onload = () => res();
    s.onerror = () => rej(new Error('recaptcha load failed'));
    document.head.appendChild(s);
  });
}

export function useRecaptcha() {
  const ready = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) return;
    loadScript().then(() => { ready.current = true; }).catch(() => { /* swallow */ });
  }, []);

  const execute = useCallback(async (action: string): Promise<string | null> => {
    if (!SITE_KEY) return null; // not configured — let server decide
    try {
      await loadScript();
      await new Promise<void>((res) => window.grecaptcha!.ready(() => res()));
      return await window.grecaptcha!.execute(SITE_KEY, { action });
    } catch {
      return null;
    }
  }, []);

  return { execute, enabled: Boolean(SITE_KEY) };
}
