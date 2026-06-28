import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Sparkles, X, Maximize2, CheckCircle2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const mdComponents = {
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold transition font-medium break-all"
    >
      {children}
    </a>
  ),
};
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
  `*المنشأة:* ${o.company_name || '—'}`,
  `*المسؤول:* ${o.contact_name}`,
  `*الجوال:* ${o.phone}`,
  o.email && `*البريد:* ${o.email}`,
  o.city && `*المدينة:* ${o.city}`,
  o.address && `*العنوان:* ${o.address}`,
  o.delivery_method && `*طريقة الاستلام:* ${o.delivery_method}`,
  o.notes && `*ملاحظات:* ${o.notes}`,
].filter(Boolean).join('\n');

const PHONE_RE = /^(\+?966|0)?5\d{8}$/;

export function AssistantWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>(() => loadMsgs());
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState({ contact_name: '', phone: '', address: '', delivery_method: 'توصيل' as 'توصيل' | 'استلام من المستودع' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
        if (resp.status === 429) throw new Error('ضغط مرتفع على المساعد، حاول بعد قليل 🙏');
        if (resp.status === 402) {
          const fallback = `عذراً، المساعد الذكي غير متاح مؤقتاً. يسعدنا خدمتك مباشرة:\n\n📱 واتساب: [اضغط هنا للتواصل](${waHref})\n📧 بريد الطلبات: mab355@gmail.com\n📞 جوال: 0540060095`;
          setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: fallback } : m));
          return;
        }
        throw new Error('فشل الاتصال بالمساعد، جرّب واتساب للتواصل الفوري');
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
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: clean + '\n\n📋 **يرجى تأكيد بياناتك في النموذج أدناه قبل إرسال الطلب.**' } : m));
        setFormData({
          contact_name: order.contact_name || '',
          phone: order.phone || '',
          address: order.address || '',
          delivery_method: order.delivery_method || 'توصيل',
        });
        setFormErrors({});
        setPendingOrder(order);
      }
    } catch (e: any) {
      const msg = e?.message ?? 'خطأ';
      toast.error(msg);
      setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: `⚠️ ${msg}\n\n[تواصل عبر واتساب](${waHref})` } : m));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };


  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant' && m.content.trim() && m.id !== 'greet');
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user' && m.content.trim());
  const contextSummary = lastAssistantMsg
    ? `مرحباً فحم النخلة 👋\n\nأكمل معكم من مساعد فحم النخلة:\n${lastUserMsg ? `\n• استفساري: ${lastUserMsg.content.slice(0, 200)}\n` : ''}• آخر رد المساعد:\n"${lastAssistantMsg.content.replace(/[#*`_>]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim().slice(0, 400)}"\n\nأرجو المتابعة 🙏`
    : 'مرحباً فحم النخلة 👋، أرغب بطلب فحم.';
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(contextSummary)}`;

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant' && m.content.trim());
  const preview = lastAssistant?.content.replace(/[#*`_>\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90);

  return (
    <>
      {/* Last-message preview pill (shown when widget is closed) */}
      {!open && preview && preview !== greet.content.replace(/[#*`_>\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90) && (
        <div
          className="fixed bottom-24 end-6 z-40 max-w-[280px] rounded-2xl rounded-br-sm border border-gold/30 bg-background shadow-gold px-3 py-2 text-xs text-foreground animate-fade-in font-arabic"
          role="status"
          aria-label="آخر رسالة من المساعد"
        >
          <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground">
            <img src={logo} alt="" className="w-3 h-3 object-contain" />
            مساعد فحم النخلة
          </div>
          <p className="line-clamp-2 leading-snug">{preview}{preview && preview.length >= 90 ? '…' : ''}</p>
        </div>
      )}

    <div
      className={`fixed bottom-24 end-6 z-50 w-[92vw] max-w-[380px] h-[78vh] max-h-[560px] rounded-2xl border border-gold/30 bg-background shadow-gold flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-out ${
        open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
      }`}
      role="dialog"
      aria-hidden={!open}
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
            {streaming ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-gold-hi animate-pulse" /> يكتب الآن…</>
            ) : submitting ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> جارٍ الإرسال…</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> متصل · مجاني</>
            )}
          </p>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer noopener"
          className="p-1.5 rounded-lg hover:bg-white/10 transition text-[#25D366]"
          aria-label="واتساب مباشر"
          title="واتساب مباشر"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
        <button
          onClick={() => { onClose(); navigate('/assistant'); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="تكبير"
          title="فتح في الشاشة الكاملة"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" aria-label="إغلاق" title="إغلاق">
          <X className="w-4 h-4" />
        </button>
      </header>


      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/20">
        {messages.map((m, idx) => {
          const isLastAssistant = m.role === 'assistant' && idx === messages.length - 1;
          const showTyping = isLastAssistant && streaming && !m.content;
          return (
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
              ) : showTyping ? (
                <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3 py-2.5" aria-label="يكتب">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed prose-strong:text-foreground prose-p:my-1">
                  {m.content && <ReactMarkdown components={mdComponents}>{m.content}</ReactMarkdown>}
                  {isLastAssistant && streaming && m.content && (
                    <span className="inline-block w-1.5 h-3.5 align-middle bg-gold/80 ms-0.5 animate-pulse" aria-hidden />
                  )}
                </div>
              )}
            </div>
          </div>
        );})}
        {submitting && (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" /> جارٍ حفظ وإرسال الطلب...
          </div>
        )}
        {messages.length === 1 && !streaming && (
          <div className="flex flex-wrap gap-1.5 pt-1 font-arabic">
            <span className="w-full text-[10px] text-muted-foreground mb-0.5">طلب سريع — اختر المنتج:</span>
            {[
              { label: '🔥 فحم شواء', q: 'أريد طلب فحم شواء، الكمية المطلوبة 100 كجم' },
              { label: '🥥 جوز الهند', q: 'أريد طلب فحم جوز الهند الطبيعي للمعسل' },
              { label: '💨 شيشة', q: 'أريد طلب فحم شيشة جوز هند' },
              { label: '🪔 بخور', q: 'أريد طلب فحم بخور صيني سريع الاشتعال' },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => { setInput(c.q); setTimeout(() => send(), 50); }}
                className="px-3 py-1.5 rounded-full text-xs bg-gold/10 hover:bg-gold/20 border border-gold/40 text-foreground transition"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-2 bg-background">
        {streaming && (
          <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[11px] text-muted-foreground font-arabic">
            <Loader2 className="w-3 h-3 animate-spin text-gold" />
            المساعد يكتب الرد…
          </div>
        )}
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
    </>
  );
}

