/**
 * Lightweight perf telemetry — Core Web Vitals + WebGL fallback tag.
 * Logs to console in dev; in prod, posts to `navigator.sendBeacon('/vitals')`
 * if available (silently no-ops otherwise — wire to your analytics later).
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { hasWebGL, webglDisabledReason } from './hasWebGL';

type Payload = Metric & { webgl: boolean; webglReason: string | null; path: string };

function send(metric: Metric) {
  const payload: Payload = {
    ...metric,
    webgl: hasWebGL(),
    webglReason: webglDisabledReason(),
    path: typeof location !== 'undefined' ? location.pathname : '',
  };

  if (import.meta.env.DEV) {
     
    console.info(`[vitals] ${metric.name} = ${metric.value.toFixed(1)} (${metric.rating})`, payload);
    return;
  }

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) navigator.sendBeacon('/vitals', body);
  } catch {
    /* swallow — telemetry must never break the page */
  }
}

let started = false;
export function initWebVitals() {
  if (started || typeof window === 'undefined') return;
  started = true;
  onCLS(send);
  onFCP(send);
  onINP(send); // replaces FID — measures "time to first interaction"
  onLCP(send);
  onTTFB(send);
}
