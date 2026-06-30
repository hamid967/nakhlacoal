import { useEffect, useState } from 'react';

export const MOTION_KEY = 'pc-reduce-motion';
export const MOTION_EVENT = 'pc:motion-change';

function readSystem(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function readUser(): boolean | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(MOTION_KEY);
  return v === '1' ? true : v === '0' ? false : null;
}

/** Effective preference: explicit user choice overrides OS, else OS. */
export function getReducedMotion(): boolean {
  const u = readUser();
  return u === null ? readSystem() : u;
}

/** Reflect preference on <html data-reduce-motion="1"> so CSS can opt-out. */
export function applyReducedMotion(v: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-reduce-motion', v ? '1' : '0');
}

export function setReducedMotion(v: boolean | null) {
  if (v === null) localStorage.removeItem(MOTION_KEY);
  else localStorage.setItem(MOTION_KEY, v ? '1' : '0');
  applyReducedMotion(getReducedMotion());
  window.dispatchEvent(new Event(MOTION_EVENT));
}

/** Reactive hook for components (e.g. useTilt). */
export function useReducedMotion(): boolean {
  const [v, setV] = useState<boolean>(() => getReducedMotion());
  useEffect(() => {
    const sync = () => setV(getReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener?.('change', sync);
    window.addEventListener(MOTION_EVENT, sync);
    applyReducedMotion(getReducedMotion());
    return () => {
      mq.removeEventListener?.('change', sync);
      window.removeEventListener(MOTION_EVENT, sync);
    };
  }, []);
  return v;
}
