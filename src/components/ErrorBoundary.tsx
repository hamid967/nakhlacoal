import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle, Bug } from 'lucide-react';

interface Props { children: ReactNode }
interface State { error: Error | null; info: ErrorInfo | null; showDetails: boolean }

const WHATSAPP = '966540060095';

function classify(err: Error): { title: string; hint: string; links: { label: string; href: string; icon?: any }[] } {
  const msg = `${err?.name ?? ''} ${err?.message ?? ''}`.toLowerCase();

  if (/chunkloaderror|dynamically imported module|importing a module script failed|preload/.test(msg)) {
    return {
      title: 'إصدار جديد من الموقع متاح',
      hint: 'تم نشر تحديث جديد وبعض الملفات القديمة لم تعد متاحة. أعد تحميل الصفحة لتحميل النسخة الأحدث.',
      links: [{ label: 'إعادة تحميل', href: 'reload', icon: RefreshCw }],
    };
  }
  if (/networkerror|failed to fetch|load failed|networkerror when attempting/.test(msg)) {
    return {
      title: 'تعذّر الاتصال بالخادم',
      hint: 'يبدو أن هناك انقطاعًا في الشبكة. تأكد من اتصالك بالإنترنت ثم أعد المحاولة.',
      links: [
        { label: 'إعادة المحاولة', href: 'reload', icon: RefreshCw },
        { label: 'تواصل عبر واتساب', href: `https://wa.me/${WHATSAPP}`, icon: MessageCircle },
      ],
    };
  }
  if (/webgl|three|context lost/.test(msg)) {
    return {
      title: 'تعذّر تشغيل الرسوم ثلاثية الأبعاد',
      hint: 'متصفحك أو جهازك لا يدعم WebGL بشكل كامل. يمكنك متابعة التصفح من الصفحة الرئيسية.',
      links: [{ label: 'العودة للرئيسية', href: '/', icon: Home }],
    };
  }
  if (/permission denied|rls|401|403|unauthor/.test(msg)) {
    return {
      title: 'صلاحيات غير كافية',
      hint: 'هذا المحتوى يتطلب تسجيل الدخول أو صلاحية إضافية على حسابك.',
      links: [
        { label: 'تسجيل الدخول', href: '/auth', icon: Home },
        { label: 'الرئيسية', href: '/', icon: Home },
      ],
    };
  }
  return {
    title: 'حدث خطأ غير متوقع',
    hint: 'واجهنا مشكلة أثناء عرض هذا الجزء من الموقع. يمكنك إعادة التحميل أو العودة للرئيسية.',
    links: [
      { label: 'إعادة تحميل', href: 'reload', icon: RefreshCw },
      { label: 'الرئيسية', href: '/', icon: Home },
      { label: 'إبلاغ عبر واتساب', href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('واجهت خطأ في موقع فحم النخلة: ' + (err?.message ?? ''))}`, icon: Bug },
    ],
  };
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null, showDetails: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  private handle = (href: string) => {
    if (href === 'reload') { window.location.reload(); return; }
    window.location.href = href;
  };

  render() {
    const { error, info, showDetails } = this.state;
    if (!error) return this.props.children;

    const { title, hint, links } = classify(error);

    return (
      <div dir="rtl" className="min-h-dvh flex items-center justify-center px-4 py-16 bg-background text-foreground">
        <div className="max-w-lg w-full rounded-2xl border border-gold/20 bg-card/80 backdrop-blur p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" aria-hidden />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{hint}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {links.map((l) => {
              const Icon = l.icon;
              const isExternal = l.href.startsWith('http');
              return (
                <button
                  key={l.label}
                  onClick={() => this.handle(l.href)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 hover:bg-gold/20 text-foreground px-3 py-2 text-sm transition"
                  {...(isExternal ? { 'aria-label': l.label } : {})}
                >
                  {Icon && <Icon className="size-4" aria-hidden />} {l.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            {showDetails ? 'إخفاء التفاصيل التقنية' : 'عرض التفاصيل التقنية'}
          </button>

          {showDetails && (
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words" dir="ltr">
{error.name}: {error.message}
{error.stack?.split('\n').slice(0, 6).join('\n')}
{info?.componentStack ? `\n---\n${info.componentStack.trim().split('\n').slice(0, 6).join('\n')}` : ''}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
