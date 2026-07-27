import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, Plus, Send } from 'lucide-react';

type Ticket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  sender_id: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
};

const CATEGORIES = [
  { v: 'general', l: 'عام' },
  { v: 'order', l: 'طلب' },
  { v: 'payment', l: 'دفع' },
  { v: 'shipping', l: 'شحن' },
  { v: 'product', l: 'منتج' },
  { v: 'wholesale', l: 'جملة' },
  { v: 'complaint', l: 'شكوى' },
  { v: 'other', l: 'أخرى' },
];

const STATUS_LABEL: Record<string, string> = {
  open: 'مفتوحة', pending: 'قيد المعالجة', resolved: 'محلولة', closed: 'مغلقة',
};

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'general', body: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('support_tickets')
        .select('id,subject,category,priority,status,created_at,updated_at')
        .order('created_at', { ascending: false });
      setTickets(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from('support_messages')
        .select('id,sender_id,body,is_internal,created_at')
        .eq('ticket_id', activeId)
        .order('created_at', { ascending: true });
      setMessages((data ?? []).filter((m) => !m.is_internal));
    })();
  }, [activeId]);

  const createTicket = async () => {
    if (!user || !form.subject.trim() || !form.body.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: form.subject.trim(),
        category: form.category,
        contact_email: user.email,
      })
      .select('id,subject,category,priority,status,created_at,updated_at')
      .single();
    if (error || !data) {
      toast({ title: 'تعذر إنشاء التذكرة', description: error?.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    await supabase.from('support_messages').insert({
      ticket_id: data.id,
      sender_id: user.id,
      body: form.body.trim(),
      is_internal: false,
    });
    setTickets([data, ...tickets]);
    setActiveId(data.id);
    setForm({ subject: '', category: 'general', body: '' });
    setShowNew(false);
    setSubmitting(false);
    toast({ title: 'تم إنشاء التذكرة', description: 'سنرد عليك خلال 4 ساعات عمل.' });
  };

  const sendReply = async () => {
    if (!user || !activeId || !reply.trim()) return;
    const body = reply.trim();
    setReply('');
    const { data } = await supabase
      .from('support_messages')
      .insert({ ticket_id: activeId, sender_id: user.id, body, is_internal: false })
      .select('id,sender_id,body,is_internal,created_at')
      .single();
    if (data) setMessages([...messages, data]);
  };

  return (
    <div className="a-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="a-display text-2xl">الدعم الفني</h1>
          <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>افتح تذكرة وسنرد عليك خلال 4 ساعات عمل</p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4" /> تذكرة جديدة
        </button>
      </div>

      {showNew && (
        <div className="a-card p-4 mb-6 space-y-3">
          <input
            className="a-input w-full"
            placeholder="عنوان التذكرة"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <select
            className="a-input w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <textarea
            className="a-input w-full min-h-[120px]"
            placeholder="اشرح مشكلتك بالتفصيل…"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <button className="a-btn" onClick={() => setShowNew(false)}>إلغاء</button>
            <button className="a-btn a-btn-primary" onClick={createTicket} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال'}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        <div className="a-card p-2 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
              لا توجد تذاكر بعد
            </div>
          ) : tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`w-full text-start p-3 rounded-lg mb-1 transition ${activeId === t.id ? 'bg-black/5' : 'hover:bg-black/5'}`}
            >
              <div className="font-medium truncate">{t.subject}</div>
              <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
                <span className="a-pill">{STATUS_LABEL[t.status] ?? t.status}</span>
                <span>{new Date(t.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="a-card p-4 min-h-[400px] flex flex-col">
          {!activeId ? (
            <div className="m-auto text-center" style={{ color: 'var(--a-text-muted)' }}>
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              اختر تذكرة لعرض المحادثة
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[75%] p-3 rounded-2xl"
                        style={{
                          background: mine ? 'var(--a-palm)' : 'var(--a-soft)',
                          color: mine ? 'white' : 'inherit',
                        }}
                      >
                        <div className="whitespace-pre-wrap text-sm">{m.body}</div>
                        <div className="text-[10px] opacity-70 mt-1">
                          {new Date(m.created_at).toLocaleString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t pt-3" style={{ borderColor: 'var(--a-border)' }}>
                <input
                  className="a-input flex-1"
                  placeholder="اكتب ردك…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                />
                <button className="a-btn a-btn-primary" onClick={sendReply}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
