import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Ticket = {
  id: string;
  user_id: string | null;
  contact_email: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
};

type Msg = { id: string; sender_id: string | null; body: string; is_internal: boolean; created_at: string };

const STATUSES = ['open', 'pending', 'resolved', 'closed'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default function AdminSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(200);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setTickets((data ?? []) as Ticket[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter]);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', activeId)
        .order('created_at', { ascending: true });
      setMessages((data ?? []) as Msg[]);
    })();
  }, [activeId]);

  const updateTicket = async (id: string, patch: Partial<Ticket>) => {
    const { error } = await supabase.from('support_tickets').update(patch).eq('id', id);
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const send = async () => {
    if (!user || !activeId || !reply.trim()) return;
    const body = reply.trim();
    setReply('');
    const { data } = await supabase
      .from('support_messages')
      .insert({ ticket_id: activeId, sender_id: user.id, body, is_internal: internal })
      .select('*')
      .single();
    if (data) setMessages([...messages, data as Msg]);
  };

  return (
    <div className="a-container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="a-display text-2xl">تذاكر الدعم</h1>
        <select className="a-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">الكل</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-[380px_1fr] gap-4">
        <div className="a-card p-2 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>لا توجد تذاكر</div>
          ) : tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`w-full text-start p-3 rounded-lg mb-1 transition ${activeId === t.id ? 'bg-black/5' : 'hover:bg-black/5'}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="font-medium truncate flex-1">{t.subject}</div>
                <span className="a-pill text-[10px]">{t.priority}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
                {t.contact_email ?? '—'} · {t.category} · {new Date(t.created_at).toLocaleDateString('ar-SA')}
              </div>
            </button>
          ))}
        </div>

        <div className="a-card p-4 min-h-[500px] flex flex-col">
          {!activeId ? (
            <div className="m-auto text-center" style={{ color: 'var(--a-text-muted)' }}>اختر تذكرة</div>
          ) : (() => {
            const t = tickets.find((x) => x.id === activeId);
            if (!t) return null;
            return (
              <>
                <div className="flex flex-wrap items-center gap-2 pb-3 border-b mb-3" style={{ borderColor: 'var(--a-border)' }}>
                  <div className="font-semibold flex-1">{t.subject}</div>
                  <select className="a-input text-xs" value={t.status} onChange={(e) => updateTicket(t.id, { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="a-input text-xs" value={t.priority} onChange={(e) => updateTicket(t.id, { priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {messages.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[75%] p-3 rounded-2xl"
                          style={{
                            background: m.is_internal ? '#FEF3C7' : mine ? 'var(--a-palm)' : 'var(--a-soft)',
                            color: m.is_internal ? '#78350F' : mine ? 'white' : 'inherit',
                            border: m.is_internal ? '1px dashed #F59E0B' : undefined,
                          }}>
                          {m.is_internal && <div className="text-[10px] font-bold mb-1">ملاحظة داخلية</div>}
                          <div className="whitespace-pre-wrap text-sm">{m.body}</div>
                          <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString('ar-SA')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--a-border)' }}>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                    ملاحظة داخلية (لا يراها العميل)
                  </label>
                  <div className="flex gap-2">
                    <input className="a-input flex-1" placeholder="اكتب ردك…" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
                    <button className="a-btn a-btn-primary" onClick={send}><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
