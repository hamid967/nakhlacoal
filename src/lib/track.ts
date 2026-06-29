// Lightweight conversion tracking. Sends to dataLayer (GA4/GTM) and Plausible if available.
// Safe no-op when none are configured. Keeps signal in console during dev.

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: any[];
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

// Debug mode: enable via ?debug=track in URL, localStorage.setItem('track:debug','1'),
// window.__TRACK_DEBUG__ = true, or automatically in DEV.
function isDebug(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if ((window as any).__TRACK_DEBUG__) return true;
    if (localStorage.getItem('track:debug') === '1') return true;
    if (new URLSearchParams(window.location.search).get('debug') === 'track') {
      localStorage.setItem('track:debug', '1');
      return true;
    }
    return !!import.meta.env.DEV;
  } catch {
    return false;
  }
}

export function trackConversion(event: string, props: Props = {}): void {
  const debugFlag = isDebug();
  // GA4 DebugView: any event carrying debug_mode:true is routed to DebugView in real-time.
  const payload = {
    event,
    ...props,
    ...(debugFlag ? { debug_mode: true } : {}),
    _ts: new Date().toISOString(),
  };
  const debug = debugFlag;

  if (debug) {
    /* eslint-disable no-console */
    console.groupCollapsed(`%c[track] → ${event}`, 'color:#b8860b;font-weight:bold');
    console.log('payload:', payload);
    console.log('props:', props);
    console.log('GTM available:', typeof (window as any).google_tag_manager !== 'undefined');
    console.log('Plausible available:', typeof window.plausible === 'function');
    /* eslint-enable no-console */
  }

  try {
    if (typeof window === 'undefined') return;

    // GA4 / GTM
    window.dataLayer = window.dataLayer || [];
    const beforeLen = window.dataLayer.length;
    window.dataLayer.push(payload);
    const pushedOk = window.dataLayer.length === beforeLen + 1;

    // Plausible
    let plausibleOk = false;
    try {
      window.plausible?.(event, { props });
      plausibleOk = typeof window.plausible === 'function';
    } catch { /* noop */ }

    if (debug) {
      // eslint-disable-next-line no-console
      console.log(
        `%c✓ dataLayer push ${pushedOk ? 'OK' : 'FAILED'} (len ${beforeLen} → ${window.dataLayer.length})${plausibleOk ? ' | plausible OK' : ''}`,
        `color:${pushedOk ? '#0a7a3b' : '#b00020'};font-weight:bold`,
      );
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  } catch (err) {
    if (debug) {
      // eslint-disable-next-line no-console
      console.error('[track] push failed', err);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
    /* swallow — tracking must never break UX */
  }
}

// Convenience helpers for the console
if (typeof window !== 'undefined') {
  (window as any).trackDebug = {
    enable: () => { localStorage.setItem('track:debug', '1'); console.info('[track] debug ON'); },
    disable: () => { localStorage.removeItem('track:debug'); console.info('[track] debug OFF'); },
    dump: () => console.table((window.dataLayer || []).slice(-20)),
  };
}

export const trackWhatsApp = (source: string) =>
  trackConversion('whatsapp_click', { source });

export const trackQuote = (track: 'retail' | 'wholesale' | 'export') =>
  trackConversion('quote_request', { track });
