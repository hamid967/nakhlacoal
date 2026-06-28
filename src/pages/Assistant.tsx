import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Send, Trash2, Sparkles, CheckCircle2, MessageCircle,
  PanelLeft, X, ArrowDown, Search, Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/palm-charcoal-logo.png';
import { SEO } from '@/components/SEO';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type Role = 'user' | 'assistant';
type Msg = { id: string; role: Role; content: string };
type Thread = { id: string; title: string; messages: Msg[]; updatedAt: number };

const STORAGE_KEY = 'nakhla.assistant.threads.v2';
const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

const QUICK_ACTIONS = [
  { label: 'فحم معسل جوز الهند', prompt: 'أرغب بطلب فحم معسل جوز الهند طبيعي 100٪، أرشدني للخطوات.' },
  { label: 'فحم بخور سريع الاشتعال', prompt: 'أحتاج فحم بخور سريع الاشتعال درجة أولى، ساعدني في تجهيز الطلب.' },
  { label: 'طلب جملة للمطاعم', prompt: 'لدي مطعم وأحتاج عرض جملة شهري للفحم، ابدأ معي الطلب.' },
  { label: 'استفسار عن التصدير', prompt: 'أريد معرفة تفاصيل التصدير خارج المملكة وكميات الحاويات.' },
];

const makeId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const seedThread = (): Thread => ({
  id: makeId(),
  title: 'محادثة جديدة',
  updatedAt: Date.now(),
  messages: [{
    id: makeId(),
    role: 'assistant',
    content: 'أهلاً بك في **مساعد فحم النخلة** 🌴\n\nأنا هنا لأساعدك في تجهيز طلبك خطوة بخطوة بأسرع وأدق طريقة. اختر من الاقتراحات أدناه أو اكتب طلبك مباشرة.',
  }],
});

function loadThreads(): Thread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveThreads(t: Thread[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* quota */ }
}

function extractOrder(text: string): { order: Record<string, unknown> | null; clean: string } {
  const m = text.match(/<<ORDER_READY>>\s*([\s\S]*?)\s*<<END>>/);
  if (!m) return { order: null, clean: text };
  try { return { order: JSON.parse(m[1]), clean: text.replace(m[0], '').trim() }; }
  catch { return { order: null, clean: text }; }
}

function buildWhatsAppMsg(o: Record<string, any>): string {
  return [
    '🌴 *طلب جديد — فحم النخلة*', '',
    `*المنتج:* ${o.product_type}`,
    `*الكمية:* ${o.quantity} ${o.unit}`,
    `*المنشأة:* ${o.company_name}`,
    `*المسؤول:* ${o.contact_name}`,
    `*الجوال:* ${o.phone}`,
    o.email && `*البريد:* ${o.email}`,
    o.city && `*المدينة:* ${o.city}`,
    o.address && `*العنوان:* ${o.address}`,
    o.business_type && `*النشاط:* ${o.business_type}`,
    o.commercial_register && `*س.ت:* ${o.commercial_register}`,
    o.delivery_date && `*التسليم:* ${o.delivery_date}`,
    o.notes && `*ملاحظات:* ${o.notes}`,
  ].filter(Boolean).join('\n');
}
const buildEmailBody = (o: Record<string, any>) => buildWhatsAppMsg(o).replace(/\*/g, '');

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'الآن';
  if (s < 3600) return `${Math.floor(s / 60)}د`;
  if (s < 86400) return `${Math.floor(s / 3600)}س`;
  return `${Math.floor(s / 86400)}ي`;
};

/* ------------------------ Thread list component ------------------------- */
function ThreadList({
  threads, activeId, onSelect, onCreate, onDelete,
}: {
  threads: Thread[]; activeId?: string;
  onSelect: (id: string) => void; onCreate: () => void; onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const list = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(t => t.title.toLowerCase().includes(needle));
  }, [threads, q]);

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <button
        onClick={onCreate}
        className="group w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl
                   bg-gradient-to-br from-primary to-primary/85 text-primary-foreground font-medium text-sm
                   shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_12px_28px_-10px_hsl(var(--primary)/0.7)]
                   transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
        محادثة جديدة
      </button>

      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="بحث في المحادثات…"
          className="w-full ps-9 pe-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-xs
                     focus:outline-none focus:border-primary/50 focus:bg-background transition"
        />
      </div>

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-1">
        محفوظة في هذا الجهاز · {threads.length}
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
        {filtered.length === 0 && (
          <div className="text-center text-xs text-muted-foreground/70 py-8">لا توجد محادثات.</div>
        )}
        {filtered.map(t => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`group relative flex items-center gap-2 rounded-xl px-2.5 py-2 cursor-pointer transition text-sm
                ${active
                  ? 'bg-gradient-to-l from-primary/10 to-transparent text-foreground ring-1 ring-primary/20'
                  : 'hover:bg-muted/60 text-foreground/85'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              <span className="flex-1 truncate">{t.title}</span>
              <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">{timeAgo(t.updatedAt)}</span>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onDelete(t.id); }}
                className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive p-1 -me-1"
                aria-label="حذف المحادثة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Main page ------------------------------- */
export default function Assistant() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId?: string }>();

  const [threads, setThreads] = useState<Thread[]>(() => {
    // Idempotent bootstrap (StrictMode-safe — no extra effect creates duplicate threads)
    const existing = loadThreads();
    if (existing.length > 0) return existing;
    const seed = [seedThread()];
    saveThreads(seed);
    return seed;
  });

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // URL ↔ thread sync (no thread creation here — already done in bootstrap)
  useEffect(() => {
    if (threads.length === 0) return;
    if (!threadId || !threads.find(t => t.id === threadId)) {
      const newest = [...threads].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      navigate(`/assistant/${newest.id}`, { replace: true });
    }
  }, [threadId, threads, navigate]);

  // Persist
  useEffect(() => { saveThreads(threads); }, [threads]);

  // Scroll
  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
  }, []);
  useEffect(() => { scrollToBottom(false); }, [threadId, scrollToBottom]);

  // Focus textarea on thread switch
  useEffect(() => { textareaRef.current?.focus(); }, [threadId]);

  const active = threads.find(t => t.id === threadId) ?? threads[0];

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [input]);

  // Scroll-to-bottom button visibility
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(dist > 200);
  };
  useEffect(() => {
    if (streaming) scrollToBottom();
  }, [threads, streaming, scrollToBottom]);

  const updateActive = (updater: (t: Thread) => Thread) => {
    setThreads(prev => prev.map(t => (t.id === active?.id ? updater(t) : t)));
  };

  const handleCreate = () => {
    const t = seedThread();
    setThreads(prev => [t, ...prev]);
    setSidebarOpen(false);
    navigate(`/assistant/${t.id}`);
  };

  const handleSelect = (id: string) => { setSidebarOpen(false); navigate(`/assistant/${id}`); };

  const handleDelete = (id: string) => {
    setThreads(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (filtered.length === 0) {
        const t = seedThread();
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

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMsg(order))}`;
      const mailUrl = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('طلب فحم جديد — ' + order.company_name)}&body=${encodeURIComponent(buildEmailBody(order))}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.open(mailUrl, '_blank', 'noopener,noreferrer'), 250);

      toast.success('تم حفظ الطلب وإرساله ✅');
      updateActive(t => ({
        ...t,
        title: order.company_name?.slice(0, 30) || t.title,
        messages: [...t.messages, {
          id: makeId(), role: 'assistant',
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

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming || !active) return;
    if (!overrideText) setInput('');

    const userMsg: Msg = { id: makeId(), role: 'user', content: text };
    const assistantId = makeId();
    const isFirstUser = !active.messages.some(m => m.role === 'user');

    updateActive(t => ({
      ...t,
      title: isFirstUser ? text.slice(0, 40) : t.title,
      messages: [...t.messages, userMsg, { id: assistantId, role: 'assistant', content: '' }],
      updatedAt: Date.now(),
    }));

    setStreaming(true);
    try {
      const baseUrl = (supabase as any).supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${baseUrl}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({
          messages: [...active.messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error('تم تجاوز حد الاستخدام، حاول بعد قليل');
        if (resp.status === 402) throw new Error('انتهت أرصدة المساعد، تواصل معنا عبر واتساب');
        throw new Error('فشل الاتصال بالمساعد');
      }
      if (!resp.body) throw new Error('استجابة فارغة');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const { clean } = extractOrder(acc);
        setThreads(prev => prev.map(t => t.id === active.id
          ? { ...t, messages: t.messages.map(m => m.id === assistantId ? { ...m, content: clean } : m) }
          : t));
      }

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

  const isEmpty = !active || (active.messages.length === 1 && active.messages[0].role === 'assistant'
    && !active.messages.some(m => m.role === 'user'));

  const sidebar = (
    <ThreadList
      threads={threads}
      activeId={active?.id}
      onSelect={handleSelect}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <SEO title="مساعد فحم النخلة AI" description="مساعد ذكي يساعدك في تقديم طلب الفحم خطوة بخطوة" path="/assistant" noindex />

      <div className="relative min-h-[calc(100vh-5rem)] bg-background overflow-hidden">
        {/* Ambient gold/ember mesh background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              'radial-gradient(900px 500px at 85% -10%, hsl(var(--gold)/0.18), transparent 60%),' +
              'radial-gradient(700px 400px at -10% 110%, hsl(15 80% 50% / 0.12), transparent 60%),' +
              'radial-gradient(600px 500px at 50% 50%, hsl(var(--primary)/0.06), transparent 70%)',
          }}
        />

        <div className="relative grid lg:grid-cols-[280px_1fr] min-h-[calc(100vh-5rem)]">
          {/* Desktop sidebar — glass panel */}
          <aside className="hidden lg:flex flex-col border-e border-border/60 bg-background/40 backdrop-blur-xl">
            {sidebar}
          </aside>

          {/* Chat region */}
          <section className="flex flex-col h-[calc(100vh-5rem)] relative">
            {/* Header */}
            <header className="border-b border-border/60 px-3 md:px-6 py-3 flex items-center gap-3
                              bg-background/60 backdrop-blur-xl z-10">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="فتح قائمة المحادثات"
                    className="lg:hidden w-9 h-9 rounded-xl border border-border/60 bg-background/60 hover:bg-muted flex items-center justify-center transition"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-[300px] sm:w-[320px]">
                  {sidebar}
                </SheetContent>
              </Sheet>

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center
                                bg-gradient-to-br from-[hsl(18,100%,58%)] via-[hsl(8,85%,38%)] to-[hsl(0,0%,5%)]
                                shadow-[0_0_0_1px_hsl(var(--gold)/0.5),0_6px_20px_-6px_hsl(15,90%,45%/0.6)]">
                  <img src={logo} alt="" className="w-7 h-7 object-contain relative z-10" />
                  <span aria-hidden className="absolute inset-0 rounded-full motion-safe:animate-ember-pulse"
                    style={{
                      background: 'radial-gradient(circle at 50% 65%, hsl(24 100% 60% / 0.55) 0%, transparent 60%)',
                      mixBlendMode: 'screen',
                    }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-sm md:text-base flex items-center gap-2 truncate">
                  مساعد فحم النخلة <Sparkles className="w-3.5 h-3.5 text-gold-hi shrink-0" />
                </h1>
                <p className="text-[11px] text-muted-foreground truncate">
                  {active?.title ?? 'يجمع بياناتك ويرسل الطلب تلقائياً'}
                </p>
              </div>

              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground
                              px-2.5 py-1 rounded-full bg-muted/40 border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> متصل
              </span>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="flex-1 overflow-y-auto px-3 md:px-6 pt-6 pb-40 scroll-smooth"
            >
              <div className="max-w-3xl mx-auto space-y-6">
                {active?.messages.map((m, i) => {
                  const isLast = i === active.messages.length - 1;
                  const isStreaming = streaming && isLast && m.role === 'assistant';
                  return (
                    <div key={m.id} className={`flex gap-3 animate-fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1
                                        bg-gradient-to-br from-[hsl(18,100%,58%)] via-[hsl(8,85%,38%)] to-[hsl(0,0%,5%)]
                                        flex items-center justify-center ring-1 ring-gold/40">
                          <img src={logo} alt="" className="w-5 h-5 object-contain" />
                        </div>
                      )}
                      <div className={`max-w-[85%] md:max-w-[80%]`}>
                        {m.role === 'user' ? (
                          <div className="rounded-2xl rounded-tr-md bg-primary text-primary-foreground
                                          px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm">
                            {m.content}
                          </div>
                        ) : (
                          <div className="text-[15px] leading-relaxed text-foreground">
                            {m.content ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none
                                              prose-headings:text-foreground prose-strong:text-foreground
                                              prose-a:text-primary prose-table:text-xs
                                              prose-th:bg-muted/50 prose-th:border-border prose-td:border-border
                                              prose-code:bg-muted/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                {isStreaming && (
                                  <span className="inline-block w-2 h-4 -mb-0.5 ms-1 bg-primary/70 animate-pulse rounded-sm" />
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <span className="relative inline-flex">
                                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  <span className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping opacity-60" />
                                </span>
                                <span className="bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_2.4s_ease-in-out_infinite]">
                                  يفكر...
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Quick actions on empty state */}
                {isEmpty && !streaming && (
                  <div className="grid sm:grid-cols-2 gap-2 pt-2">
                    {QUICK_ACTIONS.map(a => (
                      <button
                        key={a.label}
                        onClick={() => send(a.prompt)}
                        className="group text-start rounded-2xl border border-border/60 bg-background/40 hover:bg-muted/60
                                   hover:border-primary/40 transition px-4 py-3 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Sparkles className="w-3.5 h-3.5 text-gold-hi" />
                          {a.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.prompt}</div>
                      </button>
                    ))}
                  </div>
                )}

                {submitting && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400
                                 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 w-fit">
                    <CheckCircle2 className="w-4 h-4 animate-pulse" /> جارٍ حفظ الطلب وإرسال الإشعارات…
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* Scroll-to-bottom button */}
            {showScrollBtn && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-32 start-1/2 -translate-x-1/2 z-20
                           w-9 h-9 rounded-full bg-background/80 backdrop-blur-md border border-border
                           shadow-lg hover:bg-muted transition flex items-center justify-center animate-fade-in"
                aria-label="انتقل للأسفل"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            )}

            {/* Glass Dock composer */}
            <div className="absolute bottom-0 inset-x-0 px-3 md:px-6 pb-4 md:pb-6 pointer-events-none z-10">
              <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className="relative rounded-3xl bg-background/70 backdrop-blur-2xl
                                border border-border/70 shadow-[0_20px_60px_-20px_hsl(0_0%_0%/0.25),0_0_0_1px_hsl(var(--gold)/0.1)]
                                p-2 transition-all focus-within:border-primary/40
                                focus-within:shadow-[0_25px_70px_-20px_hsl(var(--primary)/0.35),0_0_0_1px_hsl(var(--gold)/0.25)]">
                  {/* Ember glow line */}
                  <div aria-hidden className="absolute inset-x-6 -top-px h-px opacity-60"
                    style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold)/0.6), transparent)' }} />

                  <div className="flex items-end gap-2 px-2 py-1">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                      }}
                      rows={1}
                      placeholder="اكتب رسالتك… (Shift+Enter لسطر جديد)"
                      disabled={streaming || submitting}
                      className="flex-1 resize-none bg-transparent border-0 px-2 py-2.5 text-[15px] leading-relaxed
                                 placeholder:text-muted-foreground/70 focus:outline-none max-h-[200px] min-h-[44px]"
                    />
                    <button
                      onClick={() => send()}
                      disabled={!input.trim() || streaming || submitting}
                      className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                                 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground
                                 shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.6)]
                                 hover:shadow-[0_12px_24px_-6px_hsl(var(--primary)/0.7)] hover:scale-[1.04]
                                 active:scale-95
                                 disabled:from-muted disabled:to-muted disabled:text-muted-foreground
                                 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
                      aria-label="إرسال"
                    >
                      {streaming
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4 rtl:rotate-180" />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/70 text-center mt-2 px-2">
                  عند تأكيد الطلب يُحفظ في النظام ويُفتح واتساب والبريد تلقائياً · المحادثات محفوظة في هذا الجهاز
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
