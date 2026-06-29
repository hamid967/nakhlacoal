// Lightweight conversion tracking. Sends to dataLayer (GA4/GTM) and Plausible if available.
// Safe no-op when none are configured. Keeps signal in console during dev.

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: any[];
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

export function trackConversion(event: string, props: Props = {}): void {
  try {
    if (typeof window === 'undefined') return;

    // GA4 / GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });

    // Plausible
    window.plausible?.(event, { props });

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[track]', event, props);
    }
  } catch {
    /* swallow — tracking must never break UX */
  }
}

export const trackWhatsApp = (source: string) =>
  trackConversion('whatsapp_click', { source });

export const trackQuote = (track: 'retail' | 'wholesale' | 'export') =>
  trackConversion('quote_request', { track });
