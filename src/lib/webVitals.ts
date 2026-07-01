/**
 * Real User Monitoring — Core Web Vitals ingestion.
 * Dev: logs to console. Prod: inserts anonymously into `public.web_vitals`
 * (RLS validates the payload). Failures are swallowed — telemetry must never
 * break the page.
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import { hasWebGL, webglDisabledReason } from './hasWebGL';

const SESSION_KEY = '__wv_sid__';
function sessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'no-session';
  }
}

async function send(metric: Metric) {
  const row = {
    metric_name: metric.name,
    metric_value: Math.max(0, Math.round(metric.value * 100) / 100),
    rating: metric.rating,
    path: location.pathname.slice(0, 512),
    webgl: hasWebGL(),
    webgl_reason: webglDisabledReason(),
    navigation_type: metric.navigationType,
    session_id: sessionId(),
    user_agent: navigator.userAgent.slice(0, 512),
  };

  if (import.meta.env.DEV) {
    console.info(`[vitals] ${metric.name}=${metric.value.toFixed(1)} (${metric.rating})`, row);
    return;
  }

  try {
    await supabase.from('web_vitals').insert(row);
  } catch {
    /* swallow */
  }
}

let started = false;
export function initWebVitals() {
  if (started || typeof window === 'undefined') return;
  started = true;
  onCLS(send);
  onFCP(send);
  onINP(send);
  onLCP(send);
  onTTFB(send);
}
