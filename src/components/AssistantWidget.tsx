import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Sparkles, X, Maximize2, CheckCircle2, MessageCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { QuoteBuilder } from './QuoteBuilder';
import { quoteFor, formatSAR } from '@/data/inventory';


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
const ORDER_STORAGE_KEY = 'palm-assistant-pending-order-v1';
const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

const greet: Msg = {
  id: 'greet',
  role: 'assistant',
  content: 'أهلاً بك في **مساعد فحم النخلة** 🌴\n\nأنا هنا لأساعدك بتجهيز طلبك خطوة بخطوة وأرشّح لك المنتج الأنسب لاستخدامك. كيف تنوي استخدام الفحم؟\n\n[QR] شواء عائلي | مطعم/مقهى | شيشة/معسل | بخور | تصدير [/QR]',
};

const loadMsgs = (): Msg[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [greet];
  } catch { return [greet]; }
};
const loadPendingOrder = (): Record<string, any> | null => {
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const makeId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Parse [QR] a | b | c [/QR] markers and strip them from displayed text
function extractQuickReplies(text: string): { chips: string[]; clean: string } {
  const m = text.match(/\[QR\]([\s\S]*?)\[\/QR\]/i);
  if (!m) return { chips: [], clean: text };
  const chips = m[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 5);
  return { chips, clean: text.replace(m[0], '').trim() };
}

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

function parseOrderIntent(text: string): { product_type: string; quantity: number; unit: 'kg' | 'carton' | 'ton' } {
  const t = text.toLowerCase();
  let product_type = 'فحم شواء';
  if (/جوز\s*هند|coconut/i.test(t)) product_type = 'فحم جوز الهند';
  else if (/شيشة|hookah|معسل/i.test(t)) product_type = 'فحم شيشة (جوز هند طبيعي)';
  else if (/بخور|incense/i.test(t)) product_type = 'فحم بخور سريع الاشتعال';
  else if (/خشب|lump/i.test(t)) product_type = 'فحم خشب';
  else if (/هدايا|gift|box/i.test(t)) product_type = 'صندوق هدايا';
  const qMatch = text.match(/(\d{1,5})\s*(كيلو|كجم|kg|كرتون|carton|طن|ton)?/i);
  const quantity = qMatch ? parseInt(qMatch[1], 10) : 50;
  const unitWord = qMatch?.[2]?.toLowerCase() ?? '';
  const unit: 'kg' | 'carton' | 'ton' = /كرتون|carton/.test(unitWord) ? 'carton' : /طن|ton/.test(unitWord) ? 'ton' : 'kg';
  return { product_type, quantity, unit };
}

export function AssistantWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>(() => loadMsgs());
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Record<string, any> | null>(() => loadPendingOrder());
  const [formData, setFormData] = useState({ contact_name: '', phone: '', address: '', delivery_method: 'توصيل' as 'توصيل' | 'استلام من المستودع' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [reviewMode, setReviewMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const hydratedFromCloud = useRef(false);

  // Track auth + hydrate pending order from cloud (cross-device) for signed-in users
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) setUserId(data.user?.id ?? null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      if (!session?.user) hydratedFromCloud.current = false;
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!userId || hydratedFromCloud.current) return;
    (async () => {
      const { data } = await supabase
        .from('pending_orders')
        .select('data, form')
        .eq('user_id', userId)
        .maybeSingle();
      hydratedFromCloud.current = true;
      if (data?.data && Object.keys(data.data as object).length) {
        setPendingOrder(data.data as Record<string, any>);
      }
      if (data?.form && Object.keys(data.form as object).length) {
        setFormData(f => ({ ...f, ...(data.form as typeof f) }));
      }
    })();
  }, [userId]);

  useEffect(() => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);

  // Persist pending order: cloud when signed-in, sessionStorage otherwise
  useEffect(() => {
    if (userId && hydratedFromCloud.current) {
      if (pendingOrder) {
        supabase.from('pending_orders').upsert({ user_id: userId, data: pendingOrder, form: formData }).then(() => {});
      } else {
        supabase.from('pending_orders').delete().eq('user_id', userId).then(() => {});
      }
      sessionStorage.removeItem(ORDER_STORAGE_KEY);
    } else {
      if (pendingOrder) sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(pendingOrder));
      else sessionStorage.removeItem(ORDER_STORAGE_KEY);
    }
  }, [pendingOrder, formData, userId]);
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const finalize = async (order: Record<string, any>, waWin?: Window | null) => {
    setSubmitting(true);
    const waText = buildWa(order);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    // Navigate the pre-opened tab to WhatsApp immediately (sync-opened to bypass popup blockers)
    if (waWin && !waWin.closed) {
      try { waWin.location.href = waUrl; } catch { /* ignore */ }
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
    try {
      const { data, error } = await supabase.functions.invoke('submit-order', { body: order });
      if (error || !data?.ok) throw new Error(error?.message || data?.error || 'failed');
      toast.success('تم إرسال الطلب على واتساب ✅');
      setMessages(m => [...m, { id: makeId(), role: 'assistant', content: `✅ **تم إرسال طلبك على واتساب!**\n\nرقم الطلب: \`${data.id}\`\nسنتواصل معك قريباً 🌴` }]);
    } catch (e: any) {
      toast.error('تم فتح واتساب، لكن تعذّر حفظ الطلب: ' + (e?.message ?? ''));
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


    const triggerOfflineOrder = (note: string) => {
      const intent = parseOrderIntent(text);
      const order = {
        product_type: intent.product_type,
        quantity: intent.quantity,
        unit: intent.unit,
        company_name: 'عميل',
        contact_name: '',
        phone: '',
        address: '',
        notes: text.slice(0, 200),
        ai_summary: `طلب مباشر: ${intent.product_type} — ${intent.quantity} ${intent.unit}`,
      };
      const summary = `📦 **ملخص الطلب**\n\n- المنتج: **${order.product_type}**\n- الكمية: **${order.quantity} ${order.unit === 'kg' ? 'كجم' : order.unit === 'carton' ? 'كرتون' : 'طن'}**\n\n${note}\n\n👇 أكمل بياناتك في النموذج أدناه لإرسال الطلب فوراً عبر واتساب.`;
      setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: summary } : m));
      setFormData({ contact_name: '', phone: '', address: '', delivery_method: 'توصيل' });
      setFormErrors({});
      setPendingOrder(order);
    };

    try {
      const baseUrl = (supabase as any).supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${baseUrl}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!resp.ok) {
        if (resp.status === 429) {
          triggerOfflineOrder('⚡ المساعد مشغول حالياً، لكن يمكنك إكمال طلبك الآن مباشرة.');
          return;
        }
        if (resp.status === 402) {
          triggerOfflineOrder('💬 المساعد الذكي غير متاح مؤقتاً — لكن طلبك جاهز للإرسال الآن.');
          return;
        }
        triggerOfflineOrder('تعذّر الاتصال بالمساعد، إليك ملخص طلبك السريع.');
        return;
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
      } else if (!acc.trim()) {
        triggerOfflineOrder('لم يصل رد من المساعد، يمكنك إتمام الطلب مباشرة.');
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

  const liveQuote = pendingOrder
    ? quoteFor(pendingOrder.product_type, Number(pendingOrder.quantity) || 0, pendingOrder.unit || 'kg')
    : null;

  const confirmOrder = () => {
    const errs: Record<string, string> = {};
    if (formData.contact_name.trim().length < 2) errs.contact_name = 'الاسم مطلوب';
    if (!PHONE_RE.test(formData.phone.trim())) errs.phone = 'رقم جوال سعودي غير صحيح (05xxxxxxxx)';
    if (formData.address.trim().length < 5) errs.address = 'العنوان مطلوب';
    if (!formData.delivery_method) errs.delivery_method = 'اختر طريقة الاستلام';
    setFormErrors(errs);
    if (Object.keys(errs).length || !pendingOrder) return;
    if (liveQuote && !liveQuote.ok) {
      toast.error(liveQuote.issues[0] || 'تعذّر تأكيد الكمية، يرجى المراجعة.');
      return;
    }
    setReviewMode(true);
  };

  const submitFinal = async () => {
    if (!pendingOrder) return;
    const waWin = window.open('about:blank', '_blank', 'noopener,noreferrer');
    const merged = {
      ...pendingOrder,
      contact_name: formData.contact_name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      delivery_method: formData.delivery_method,
      notes: [pendingOrder.notes, `طريقة الاستلام: ${formData.delivery_method}`].filter(Boolean).join(' · '),
    };
    setPendingOrder(null);
    setReviewMode(false);
    await finalize(merged, waWin);
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
          className="fixed bottom-24 end-6 z-40 max-w-[280px] rounded-2xl rounded-br-sm glass-strip !border-gold/30 px-3 py-2 text-xs text-foreground animate-fade-in font-arabic"
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
      className={`fixed bottom-24 end-6 z-50 w-[92vw] max-w-[380px] h-[78vh] max-h-[560px] rounded-2xl glass-card !border-gold/30 flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-out ${
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
          onClick={() => { setMessages([greet]); setPendingOrder(null); setInput(''); inputRef.current?.focus(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="محادثة جديدة"
          title="بدء محادثة جديدة"
        >
          <Sparkles className="w-4 h-4 text-gold-hi" />
        </button>
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
          const { chips, clean } = m.role === 'assistant' ? extractQuickReplies(m.content) : { chips: [], clean: m.content };
          const showChips = isLastAssistant && !streaming && chips.length > 0 && !pendingOrder;
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
                  {clean && <ReactMarkdown components={mdComponents}>{clean}</ReactMarkdown>}
                  {isLastAssistant && streaming && clean && (
                    <span className="inline-block w-1.5 h-3.5 align-middle bg-gold/80 ms-0.5 animate-pulse" aria-hidden />
                  )}
                </div>
              )}
              {showChips && (
                <div className="flex flex-wrap gap-1.5 mt-2 font-arabic">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setInput(c); setTimeout(() => send(), 30); }}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-gold/10 hover:bg-gold/20 border border-gold/40 text-foreground transition"
                    >
                      {c}
                    </button>
                  ))}
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
            <button
              onClick={() => setQuoteOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs bg-gold text-dark hover:bg-gold/90 border border-gold font-semibold transition inline-flex items-center gap-1"
            >
              <FileText className="w-3 h-3" /> احسب عرض سعر فوري
            </button>
          </div>
        )}
      </div>
      <QuoteBuilder open={quoteOpen} onOpenChange={setQuoteOpen} />


      {/* Final review screen */}
      {pendingOrder && reviewMode && (
        <div className="border-t border-gold/30 bg-gradient-to-b from-gold/10 to-gold/5 p-3 space-y-3 font-arabic max-h-[55%] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> مراجعة نهائية للطلب
            </p>
            <button onClick={() => setReviewMode(false)} className="text-[10px] text-muted-foreground hover:text-foreground underline">تعديل</button>
          </div>
          <dl className="rounded-xl border border-gold/30 bg-background/60 backdrop-blur p-2.5 text-[11px] space-y-1.5">
            <div className="flex justify-between gap-2 border-b border-gold/15 pb-1">
              <dt className="text-muted-foreground">المنتج</dt>
              <dd className="font-semibold text-foreground text-end">{pendingOrder.product_type}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-gold/15 pb-1">
              <dt className="text-muted-foreground">الكمية</dt>
              <dd className="font-semibold text-foreground">{pendingOrder.quantity} {pendingOrder.unit}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-gold/15 pb-1">
              <dt className="text-muted-foreground">الاسم</dt>
              <dd className="font-semibold text-foreground text-end">{formData.contact_name}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-gold/15 pb-1">
              <dt className="text-muted-foreground">الجوال</dt>
              <dd dir="ltr" className="font-semibold text-foreground">{formData.phone}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-gold/15 pb-1">
              <dt className="text-muted-foreground">العنوان</dt>
              <dd className="font-semibold text-foreground text-end max-w-[60%]">{formData.address}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">طريقة الاستلام</dt>
              <dd className="font-semibold text-foreground">{formData.delivery_method}</dd>
            </div>
            {pendingOrder.ai_summary && (
              <div className="border-t border-gold/15 pt-1 text-[10px] italic text-muted-foreground">
                {pendingOrder.ai_summary}
              </div>
            )}
          </dl>
          <p className="text-[10px] text-muted-foreground text-center">سيتم إرسال الطلب للنظام مباشرة وفتح واتساب للتأكيد مع المبيعات.</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReviewMode(false)}
              disabled={submitting}
              className="py-2 rounded-lg border border-border bg-background text-xs font-semibold hover:bg-muted transition"
            >
              تعديل البيانات
            </button>
            <button
              onClick={submitFinal}
              disabled={submitting}
              className="py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              إرسال نهائي
            </button>
          </div>
        </div>
      )}

      {/* Order confirmation form */}
      {pendingOrder && !reviewMode && (
        <div className="border-t border-gold/30 bg-gold/5 p-3 space-y-2 font-arabic max-h-[55%] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              📋 تأكيد بيانات الطلب
            </p>
            <button onClick={() => setPendingOrder(null)} className="text-[10px] text-muted-foreground hover:text-foreground">إلغاء</button>
          </div>
          {/* Progress stepper */}
          <ol className="flex items-center gap-1 text-[9px] text-muted-foreground">
            {[
              { k: 'منتج', done: !!pendingOrder.product_type },
              { k: 'كمية', done: !!pendingOrder.quantity },
              { k: 'بيانات', done: formData.contact_name.length > 1 && PHONE_RE.test(formData.phone) },
              { k: 'عنوان', done: formData.address.length > 4 },
              { k: 'تأكيد', done: false },
            ].map((s, i, arr) => (
              <li key={s.k} className="flex items-center gap-1 flex-1">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${s.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground border border-border'}`}>{s.done ? '✓' : i + 1}</span>
                <span className={s.done ? 'text-foreground font-medium' : ''}>{s.k}</span>
                {i < arr.length - 1 && <span className={`flex-1 h-px ${s.done ? 'bg-emerald-500/50' : 'bg-border'}`} />}
              </li>
            ))}
          </ol>
          <p className="text-[10px] text-muted-foreground border-t border-gold/15 pt-1.5">
            <span className="font-semibold text-foreground">{pendingOrder.product_type}</span> · {pendingOrder.quantity} {pendingOrder.unit}
            {pendingOrder.ai_summary && <span className="block mt-0.5 italic">{pendingOrder.ai_summary}</span>}
          </p>
          <div className="space-y-1.5">
            <div>
              <input
                value={formData.contact_name}
                onChange={(e) => setFormData(f => ({ ...f, contact_name: e.target.value }))}
                placeholder="الاسم الكامل *"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {formErrors.contact_name && <p className="text-[10px] text-destructive mt-0.5">{formErrors.contact_name}</p>}
            </div>
            <div>
              <input
                value={formData.phone}
                onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                placeholder="رقم الجوال (05xxxxxxxx) *"
                dir="ltr"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold text-right"
              />
              {formErrors.phone && <p className="text-[10px] text-destructive mt-0.5">{formErrors.phone}</p>}
            </div>
            <div>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                placeholder="العنوان (المدينة، الحي، الشارع) *"
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold resize-none"
              />
              {formErrors.address && <p className="text-[10px] text-destructive mt-0.5">{formErrors.address}</p>}
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">طريقة الاستلام *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['توصيل', 'استلام من المستودع'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, delivery_method: m }))}
                    className={`px-2 py-1.5 rounded-lg text-[11px] border transition ${
                      formData.delivery_method === m
                        ? 'bg-gold text-dark border-gold font-semibold'
                        : 'bg-background border-border text-foreground hover:border-gold/50'
                    }`}
                  >
                    {m === 'توصيل' ? '🚚 توصيل' : '🏭 استلام من المستودع'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={confirmOrder}
            disabled={submitting}
            className="w-full mt-2 py-2 rounded-lg bg-dark text-cream text-xs font-semibold shadow-gold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-gold-hi" />}
            تأكيد وإرسال الطلب
          </button>
        </div>
      )}


      {/* Composer */}
      <div className="border-t border-gold/20 p-2 glass-strip">
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

