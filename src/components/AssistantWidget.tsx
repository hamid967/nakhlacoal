import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Sparkles, X, Maximize2, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/palm-charcoal-logo.png';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

const STORAGE_KEY = 'palm-assistant-widget-v1';
const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

const greet: Msg = {
  id: 'greet',
  role: 'assistant',
  content: 'أهلاً بك في **مساعد فحم النخلة** 🌴\n\nسأساعدك بتجهيز طلبك خطوة بخطوة. ما نوع الفحم الذي تحتاجه؟ (شواء، جوز هند، شيشة، بخور…)',
};

const loadMsgs = (): Msg[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [greet];
  } catch { return [greet]; }
};
const makeId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function extractOrder(text: string): { order: Record<string, any> | null; clean: string } {
  const m = text.match(/<<ORDER_READY>>\s*([\s\S]*?)\s*<<END>>/);
  if (!m) return { order: null, clean: text };
  try { return { order: JSON.parse(m[1]), clean: text.replace(m[0], '').trim() }; }
  catch { return { order: null, clean: text }; }
}
const buildWa = (o: Record<string, any>) => [
  '🌴 *طلب جديد — فحم النخلة*', '',
  `*المنتج:* ${o.product_type}`,
  `*الكمية:* ${o.quantity} ${o.unit}`,
  `*المنشأة:* ${o.company_name}`,
  `*المسؤول:* ${o.contact_name}`,
  `*الجوال:* ${o.phone}`,
  o.email && `*البريد:* ${o.email}`,
  o.city && `*المدينة:* ${o.city}`,
  o.notes && `*ملاحظات:* ${o.notes}`,
].filter(Boolean).join('\n');

export function AssistantWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>(() => loadMsgs());
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const finalize = async (order: Record<string, any>) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-order', { body: order });
      if (error || !data?.ok) throw new Error(error?.message || data?.error || 'failed');
      const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWa(order))}`;
      const mail = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('طلب فحم — ' + order.company_name)}&body=${encodeURIComponent(buildWa(order).replace(/\*/g, ''))}`;
      window.open(wa, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.open(mail, '_blank', 'noopener,noreferrer'), 250);
      toast.success('تم إرسال الطلب ✅');
      setMessages(m => [...m, { id: makeId(), role: 'assistant', content: `✅ **تم استلام طلبك!**\n\nرقم الطلب: \`${data.id}\`\nسنتواصل معك قريباً 🌴` }]);
    } catch (e: any) {
      toast.error('تعذر الإرسال: ' + (e?.message ?? ''));
    } finally { setSubmitting(false); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    const userMsg: Msg = { id: makeId(), role: 'user', content: text };
    const aId = makeId();
    const next = [...messages, userMsg, { id: aId, role: 'assistant' as const, content: '' }];
    setMessages(next);
    setStreaming(true);
    try {
      const baseUrl = (supabase as any).supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${baseUrl}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!resp.ok) {
        if (resp.status === 429) throw new Error('تم تجاوز حد الاستخدام، حاول لاحقاً');
        if (resp.status === 402) throw new Error('انتهت الأرصدة، تواصل مع الإدارة');
        throw new Error('فشل الاتصال');
      }
      if (!resp.body) throw new Error('استجابة فارغة');
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const { clean } = extractOrder(acc);
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: clean } : m));
      }
      const { order, clean } = extractOrder(acc);
      if (order) {
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: clean } : m));
        await finalize(order);
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'خطأ');
      setMessages(prev => prev.filter(m => m.id !== aId));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed bottom-24 end-6 z-50 w-[92vw] max-w-[380px] h-[78vh] max-h-[560px] rounded-2xl border border-gold/30 bg-background shadow-gold flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
      role="dialog"
      aria-label="مساعد فحم النخلة"
    >
      {/* Header */}
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-gold/20 bg-dark text-cream">
        <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center">
          <img src={logo} alt="" className="w-6 h-6 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold flex items-center gap-1.5 font-arabic">
            مساعد فحم النخلة <Sparkles className="w-3.5 h-3.5 text-gold-hi" />
          </p>
          <p className="text-[10px] opacity-70 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> متصل · مجاني
          </p>
        </div>
        <button
          onClick={() => { onClose(); navigate('/assistant'); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="تكبير"
          title="فتح في الشاشة الكاملة"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" aria-label="إغلاق">
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/20">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center shrink-0">
                <img src={logo} alt="" className="w-4 h-4 object-contain" />
              </div>
            )}
            <div className="max-w-[85%]">
              {m.role === 'user' ? (
                <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap">
                  {m.content}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed prose-strong:text-foreground prose-p:my-1">
                  {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
              )}
            </div>
          </div>
        ))}
        {submitting && (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" /> جارٍ حفظ وإرسال الطلب...
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-2 bg-background">
        <div className="flex items-end gap-1.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="اكتب رسالتك..."
            disabled={streaming || submitting}
            className="flex-1 resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-28 min-h-[40px]"
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming || submitting}
            className="shrink-0 w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition"
            aria-label="إرسال"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
}
