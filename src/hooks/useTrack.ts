import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'pc_analytics_session';

function getSessionId(): string {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

/**
 * Lightweight behavior tracker → analytics_events table.
 * Fire-and-forget; failures are swallowed so UX never blocks.
 */
export async function track(event: string, properties: Record<string, unknown> = {}): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      session_id: getSessionId(),
      user_id: userData.user?.id ?? null,
      event_name: event,
      properties,
      url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch {
    /* silent */
  }
}

export function useTrack() {
  return useCallback((event: string, properties: Record<string, unknown> = {}) => {
    void track(event, properties);
  }, []);
}
