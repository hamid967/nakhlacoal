import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Loader2 } from 'lucide-react';

type Conv = { id: string; customer_phone: string; status: string; last_message_at: string | null; last_message_preview: string | null; unread_count: number };
type Msg = { id: string; direction: string; body: string | null; template_name: string | null; status: string; created_at: string };

export default function AdminWhatsApp() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(100);
      setConvs((data ?? []) as Conv[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase.from('whatsapp_messages').select('*').eq('conversation_id', activeId).order('created_at');
      setMsgs((data ?? []) as Msg[]);
    })();
  }, [activeId]);

  return (
    <div className="a-container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="a-display text-2xl"><MessageCircle className="inline w-6 h-6 me-2" />صندوق WhatsApp</h1>
        <span className="a-pill text-xs">وضع تجريبي — يتطلب اعتماد قوالب Meta لتفعيل الإرسال</span>
      </div>

      <div className="grid md:grid-cols-[340px_1fr] gap-4">
        <div className="a-card p-2 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
          ) : convs.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
              لا توجد محادثات بعد.<br />ستظهر الرسائل الواردة هنا بعد ربط Meta Cloud API.
            </div>
          ) : convs.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={`w-full text-start p-3 rounded-lg mb-1 transition ${activeId === c.id ? 'bg-black/5' : 'hover:bg-black/5'}`}>
              <div className="flex justify-between items-start">
                <div className="font-medium">{c.customer_phone}</div>
                {c.unread_count > 0 && <span className="a-pill text-[10px]" style={{ background: 'var(--a-ember)', color: 'white' }}>{c.unread_count}</span>}
              </div>
              <div className="text-xs mt-1 truncate" style={{ color: 'var(--a-text-muted)' }}>{c.last_message_preview ?? '—'}</div>
            </button>
          ))}
        </div>

        <div className="a-card p-4 min-h-[500px] flex flex-col">
          {!activeId ? (
            <div className="m-auto text-center" style={{ color: 'var(--a-text-muted)' }}>
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              اختر محادثة لعرض الرسائل
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {msgs.map((m) => (
                <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%] p-3 rounded-2xl"
                    style={{ background: m.direction === 'outbound' ? 'var(--a-palm)' : 'var(--a-soft)', color: m.direction === 'outbound' ? 'white' : 'inherit' }}>
                    <div className="whitespace-pre-wrap text-sm">{m.body ?? `[قالب: ${m.template_name}]`}</div>
                    <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString('ar-SA')} · {m.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
