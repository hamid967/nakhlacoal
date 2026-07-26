import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Send, Trash2, MessageSquarePlus, Loader2, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BrandLogo } from '@/components/BrandLogo';
import { SEO } from '@/components/SEO';

type Role = 'user' | 'assistant';
type Msg = { id: string; role: Role; content: string };
type Thread = { id: string; title: string; messages: Msg[]; updatedAt: number };

const STORAGE_KEY = 'palm-assistant-threads-v1';
const WHATSAPP_NUMBER = '966540060085';
const ORDER_EMAIL = 'nakhlacoal@gmail.com';

function loadThreads(): Thread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Thread[]) : [];
  } catch {
    return [];
  }
}
function saveThreads(t: Thread[]) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* ignore */ }
}
function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function newThread(): Thread {
  return {
    id: makeId(),
    title: 'طلب جديد',
    updatedAt: Date.now(),
    messages: [{
      id: makeId(),
      role: 'assistant',
      content: 'أهلاً بك في **مساعد فحم النخلة** 🌴\n\nسأساعدك في تجهيز طلبك خطوة بخطوة. للبدء، أخبرني:\n\n**ما نوع الفحم الذي تحتاجه؟** (شواء، جوز هند، شيشة، خشب، صناديق هدايا)\nوما هو استخدامك المتوقع له؟',
    }],
  };
}

function extractOrder(text: string): { order: Record<string, unknown> | null; clean: string } {
  const match = text.match(/<<ORDER_READY>>\s*([\s\S]*?)\s*<<END>>/);
  if (!match) return { order: null, clean: text };
  try {
    const order = JSON.parse(match[1]);
    return { order, clean: text.replace(match[0], '').trim() };
  } catch {
    return { order: null, clean: text };
  }
}

function buildWhatsAppMsg(o: Record<string, any>): string {
  return [
    '🌴 *طلب جديد — فحم النخلة*',
    '',
    `*المنتج:* ${o.product_type}`,
    `*الكمية:* ${o.quantity} ${o.unit}`,
    `*المنشأة:* ${o.company_name}`,
    `*المسؤول:* ${o.contact_name}`,
    `*الجوال:* ${o.phone}`,
    o.email ? `*البريد:* ${o.email}` : null,
    o.city ? `*المدينة:* ${o.city}` : null,
    o.address ? `*العنوان:* ${o.address}` : null,
    o.business_type ? `*النشاط:* ${o.business_type}` : null,
    o.commercial_register ? `*س.ت:* ${o.commercial_register}` : null,
    o.delivery_date ? `*التسليم:* ${o.delivery_date}` : null,
    o.notes ? `*ملاحظات:* ${o.notes}` : null,
  ].filter(Boolean).join('\n');
}

function buildEmailBody(o: Record<string, any>): string {
  return buildWhatsAppMsg(o).replace(/\*/g, '');
}

export default function Assistant() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId?: string }>();
  const [threads, setThreads] = useState<Thread[]>(() => loadThreads());
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Bootstrap: ensure a thread exists and URL matches one
  useEffect(() => {
    let current = threads;
    if (current.length === 0) {
      const t = newThread();
      current = [t];
      setThreads(current);
      saveThreads(current);
      navigate(`/assistant/${t.id}`, { replace: true });
      return;
    }
    if (!threadId || !current.find(t => t.id === threadId)) {
      navigate(`/assistant/${current[0].id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => { saveThreads(threads); }, [threads]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [threadId, threads]);
  useEffect(() => { textareaRef.current?.focus(); }, [threadId]);

  const active = threads.find(t => t.id === threadId) ?? threads[0];

  const updateActive = (updater: (t: Thread) => Thread) => {
    setThreads(prev => prev.map(t => (t.id === active?.id ? updater(t) : t)));
  };

  const handleCreate = () => {
    const t = newThread();
    setThreads(prev => [t, ...prev]);
    navigate(`/assistant/${t.id}`);
  };

  const handleDelete = (id: string) => {
    setThreads(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (filtered.length === 0) {
        const t = newThread();
        navigate(`/assistant/${t.id}`, { replace: true });
        return [t];
      }
      if (id === active?.id) navigate(`/assistant/${filtered[0].id}`, { replace: true });
      return filtered;
    });
  };

  const finalizeOrder = async (order: Record<string, any>) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-order', { body: order });
      if (error || !data?.ok) throw new Error(error?.message || data?.error || 'failed');

      // Open WhatsApp + email in new tabs
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMsg(order))}`;
      const mailUrl = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('طلب فحم جديد — ' + order.company_name)}&body=${encodeURIComponent(buildEmailBody(order))}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.open(mailUrl, '_blank', 'noopener,noreferrer'), 250);

      toast.success('تم حفظ الطلب وإرساله ✅');
      updateActive(t => ({
        ...t,
        title: order.company_name?.slice(0, 30) || t.title,
        messages: [...t.messages, {
          id: makeId(),
          role: 'assistant',
          content: `✅ **تم استلام طلبك بنجاح!**\n\nرقم الطلب: \`${data.id}\`\n\nسيتواصل معك فريقنا قريباً عبر الجوال أو البريد. شكراً لاختيارك فحم النخلة 🌴`,
        }],
        updatedAt: Date.now(),
      }));
    } catch (e: any) {
      toast.error('تعذر حفظ الطلب: ' + (e?.message ?? 'خطأ غير معروف'));
    } finally {
      setSubmitting(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming || !active) return;
    setInput('');

    const userMsg: Msg = { id: makeId(), role: 'user', content: text };
    const assistantId = makeId();
    updateActive(t => ({
      ...t,
      messages: [...t.messages, userMsg, { id: assistantId, role: 'assistant', content: '' }],
      updatedAt: Date.now(),
    }));

    setStreaming(true);
    try {
      const baseUrl = (supabase as any).supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${baseUrl}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        body: JSON.stringify({
          messages: [...active.messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error('تم تجاوز حد الاستخدام، حاول بعد قليل');
        if (resp.status === 402) throw new Error('انتهت الأرصدة، الرجاء التواصل مع الإدارة');
        throw new Error('فشل الاتصال بالمساعد');
      }
      if (!resp.body) throw new Error('استجابة فارغة');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        const { clean } = extractOrder(acc);
        const display = clean;
        setThreads(prev => prev.map(t => t.id === active.id
          ? { ...t, messages: t.messages.map(m => m.id === assistantId ? { ...m, content: display } : m) }
          : t));
      }

      // Check for finalized order
      const { order, clean } = extractOrder(acc);
      if (order) {
        setThreads(prev => prev.map(t => t.id === active.id
          ? { ...t, messages: t.messages.map(m => m.id === assistantId ? { ...m, content: clean } : m) }
          : t));
        await finalizeOrder(order);
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'خطأ');
      setThreads(prev => prev.map(t => t.id === active.id
        ? { ...t, messages: t.messages.filter(m => m.id !== assistantId) }
        : t));
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <>
      <SEO title="مساعد فحم النخلة AI" description="مساعد ذكي يساعدك في تقديم طلب الفحم خطوة بخطوة" path="/assistant" noindex />
      <div className="min-h-[calc(100vh-5rem)] bg-background grid md:grid-cols-[280px_1fr]">
        {/* Threads sidebar */}
        <aside className="border-e border-border bg-muted/30 p-3 md:p-4 flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> محادثة جديدة
          </button>
          <div className="text-xs text-muted-foreground px-1">المحادثات (هذه الجلسة فقط)</div>
          <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
            {threads.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-6">
                <MessageSquarePlus className="w-6 h-6 mx-auto mb-2 opacity-50" />
                لا توجد محادثات بعد
              </div>
            )}
            {threads.sort((a, b) => b.updatedAt - a.updatedAt).map(t => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition text-sm ${
                  t.id === active?.id ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/60 text-foreground/80'
                }`}
                onClick={() => navigate(`/assistant/${t.id}`)}
              >
                <MessageCircle className="w-4 h-4 shrink-0 opacity-60" />
                <span className="flex-1 truncate">{t.title}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                  className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive p-1"
                  aria-label="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <section className="flex flex-col h-[calc(100vh-5rem)]">
          {/* Header */}
          <header className="border-b border-border px-4 md:px-6 py-3 flex items-center gap-3 bg-background/95 backdrop-blur">
            <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center shrink-0">
              <BrandLogo alt="" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm md:text-base flex items-center gap-2">
                مساعد فحم النخلة <Sparkles className="w-4 h-4 text-gold-hi" />
              </h1>
              <p className="text-xs text-muted-foreground">يجمع بياناتك ويُرسل الطلب تلقائياً</p>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> متصل
            </span>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4">
            {active?.messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center shrink-0">
                    <BrandLogo alt="" className="w-6 h-6 object-contain" />
                  </div>
                )}
                <div className={`max-w-[80%] ${m.role === 'user' ? 'order-1' : ''}`}>
                  {m.role === 'user' ? (
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-table:text-xs prose-th:bg-muted/50 prose-td:border-border prose-th:border-border">
                      {m.content ? (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {submitting && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4 animate-pulse" /> جارٍ حفظ الطلب وإرسال الإشعارات...
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-3 md:p-4 bg-background">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="اكتب رسالتك... (Shift+Enter لسطر جديد)"
                disabled={streaming || submitting}
                className="flex-1 resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-40 min-h-[48px]"
                style={{ fieldSizing: 'content' } as any}
              />
              <button
                onClick={send}
                disabled={!input.trim() || streaming || submitting}
                className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="إرسال"
              >
                {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              عند تأكيد الطلب، سيُحفظ في النظام ويُفتح واتساب والبريد تلقائياً
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
