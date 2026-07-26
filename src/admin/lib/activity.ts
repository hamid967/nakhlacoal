import { supabase } from '@/integrations/supabase/client';

export type ActivityAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'other';

export interface LogActivityInput {
  action: ActivityAction;
  entity_table: string;
  entity_id?: string | number | null;
  summary?: string;
  old_data?: unknown;
  new_data?: unknown;
}

/**
 * Fire-and-forget audit logger for admin actions.
 * Silently no-ops when the user isn't signed in; RLS restricts inserts to admins anyway.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) return;
    await supabase.from('activity_log').insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: input.action,
      entity_table: input.entity_table,
      entity_id: input.entity_id != null ? String(input.entity_id) : null,
      summary: input.summary ?? null,
      old_data: (input.old_data ?? null) as never,
      new_data: (input.new_data ?? null) as never,
    });
  } catch {
    // Never let audit logging break user flow
  }
}
