import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Admin-only Realtime listener for new chat conversations.
 * Fires a toast + optional sound whenever a customer opens a new thread
 * with the AI assistant. Ignores replayed rows on mount.
 */
export function useRealtimeConversations() {
  const navigate = useNavigate();
  const seen = useRef<Set<string>>(new Set());
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          const row = payload.new as { id?: string; title?: string; last_message_preview?: string; created_at?: string };
          if (!row?.id || seen.current.has(row.id)) return;
          if (row.created_at && new Date(row.created_at).getTime() < mountedAt.current - 5000) return;
          seen.current.add(row.id);

          try { new Audio('/notification.mp3').play().catch(() => {}); } catch { /* noop */ }

          toast({
            title: '💬 محادثة جديدة مع المساعد',
            description: row.last_message_preview || row.title || 'عميل بدأ محادثة',
            duration: 8000,
            action: (
              <button
                onClick={() => navigate('/admin/chats')}
                className="text-xs font-semibold underline"
              >
                عرض
              </button>
            ) as any,
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [navigate]);
}
