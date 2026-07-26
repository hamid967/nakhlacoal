import { useState } from 'react';
import { Save, Building2, Bell, Palette, Globe2, ShieldCheck, Upload, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';


const TABS = [
  { id: 'general', label: 'عام', icon: Building2 },
  { id: 'theme', label: 'المظهر', icon: Palette },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'integrations', label: 'التكاملات', icon: Globe2 },
  { id: 'security', label: 'الأمان', icon: ShieldCheck },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('general');

  return (
    <div className="space-y-6">
      {/* Page header — Untitled UI style */}
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">الإدارة · الإعدادات</p>
          <h1>الإعدادات</h1>
          <p>إدارة معلومات الشركة، التفضيلات، والتكاملات.</p>
        </div>
        <button className="a-btn a-btn-palm" onClick={() => toast.success('تم حفظ جميع التغييرات')}>
          <Save className="w-4 h-4" /> حفظ التغييرات
        </button>
      </header>

      {/* Horizontal tab bar (Untitled UI) */}
      <nav className="flex gap-1 overflow-x-auto border-b -mt-2" style={{ borderColor: 'var(--a-border)' }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-[2px] transition-colors"
              style={{
                color: active ? 'var(--a-palm)' : 'var(--a-text-muted)',
                borderColor: active ? 'var(--a-palm)' : 'transparent',
              }}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      <div className="space-y-8">
        {tab === 'general' && (
          <>
            <Section
              title="ملف الشركة"
              description="هذه المعلومات تظهر في الفواتير وصفحات التواصل."
            >
              <Row>
                <Field label="اسم الشركة" defaultValue="فحم النخلة — Palm Charcoal" />
                <Field label="المقر" defaultValue="جدة، المملكة العربية السعودية" />
              </Row>
              <Row>
                <Field label="جوال الأعمال" defaultValue="+966540060095" />
                <Field label="البريد الإلكتروني" defaultValue="mab355@gmail.com" type="email" />
              </Row>
              <Row>
                <Field label="السجل التجاري" defaultValue="1431135825" />
                <Field label="الرقم الضريبي" defaultValue="—" />
              </Row>
            </Section>

            <Section
              title="هوية العلامة"
              description="الشعار الذي يظهر في الواجهة العامة والفواتير."
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl border flex items-center justify-center text-xs"
                  style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)', color: 'var(--a-text-muted)' }}
                >
                  LOGO
                </div>
                <button className="a-btn">
                  <Upload className="w-4 h-4" /> رفع شعار جديد
                </button>
              </div>
            </Section>
          </>
        )}

        {tab === 'theme' && (
          <Section title="المظهر" description="اختر سمة الواجهة الافتراضية للوحة الإدارة.">
            <Row>
              <Toggle label="الوضع الداكن" description="تفعيل السمة الداكنة افتراضياً." />
              <Toggle label="تباين عالي" description="لتحسين قابلية القراءة." />
            </Row>
          </Section>
        )}

        {tab === 'notifications' && (
          <Section title="قنوات الإشعارات" description="اختر كيف تتلقى تنبيهات الطلبات والشحنات.">
            <Toggle label="إشعارات البريد الإلكتروني" description="ملخص يومي + تنبيهات الطلبات الجديدة." defaultChecked />
            <Toggle label="إشعارات واتساب" description="تنبيهات فورية على رقم العمل." defaultChecked />
            <Toggle label="إشعارات المتصفح" description="Push notifications داخل لوحة الإدارة." />
          </Section>
        )}

        {tab === 'integrations' && (
          <Section title="التكاملات" description="الخدمات الخارجية المربوطة بحسابك.">
            <IntegrationRow name="WhatsApp Business" status="connected" />
            <IntegrationRow name="Google Analytics" status="disconnected" />
            <IntegrationRow name="ZATCA Fatoora" status="connected" />
            <ResendTestRow />
          </Section>
        )}


        {tab === 'security' && (
          <Section title="الأمان" description="حماية الحساب والجلسات النشطة.">
            <Toggle label="المصادقة الثنائية (2FA)" description="طبقة حماية إضافية عند تسجيل الدخول." />
            <Toggle label="تسجيل الخروج التلقائي" description="بعد 30 دقيقة من الخمول." defaultChecked />
            <div>
              <button className="a-btn">إنهاء جميع الجلسات الأخرى</button>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ---------- Untitled UI primitives ---------- */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid lg:grid-cols-[280px_1fr] gap-6 pb-8 border-b" style={{ borderColor: 'var(--a-border)' }}>
      <div>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>{title}</h2>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  defaultValue,
  type = 'text',
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1.5" style={{ color: 'var(--a-text)' }}>{label}</div>
      <input className="a-input" type={type} defaultValue={defaultValue} />
    </label>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--a-text)' }}>{label}</div>
        {description && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--a-text-muted)' }}>{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors"
        style={{ background: on ? 'var(--a-palm)' : 'var(--a-border)' }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ insetInlineStart: on ? '18px' : '2px' }}
        />
      </button>
    </div>
  );
}

function IntegrationRow({ name, status }: { name: string; status: 'connected' | 'disconnected' }) {
  const connected = status === 'connected';
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--a-border)' }}>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg border flex items-center justify-center"
          style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)' }}
        >
          <Globe2 className="w-4 h-4" style={{ color: 'var(--a-text-muted)' }} />
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--a-text)' }}>{name}</div>
          <span className={`a-pill ${connected ? 'a-pill-emerald' : 'a-pill-slate'} mt-1`}>
            {connected ? 'مفعّل' : 'غير مفعّل'}
          </span>
        </div>
      </div>
      <button className="a-btn">{connected ? 'إدارة' : 'ربط'}</button>
    </div>
  );
}

function ResendTestRow() {
  const [email, setEmail] = useState('nakhlacoal@gmail.com');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('أدخل بريداً إلكترونياً صحيحاً');
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { to: value },
      });
      if (error) throw error;
      if ((data as any)?.ok) {
        toast.success(`تم إرسال بريد الاختبار إلى ${value}`);
      } else {
        toast.error('فشل الإرسال — راجع سجلات الخادم');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'فشل الإرسال');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="mt-4 rounded-xl border p-4"
      style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4" style={{ color: 'var(--a-palm)' }} />
        <div className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>
          اختبار Resend
        </div>
      </div>
      <p className="text-sm mb-3" style={{ color: 'var(--a-text-muted)' }}>
        أرسل بريداً تجريبياً للتحقق من النطاق الموثّق قبل تفعيل الإرسال التلقائي للعملاء.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          className="a-input flex-1"
          dir="ltr"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="a-btn a-btn-palm justify-center"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال…
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" /> إرسال بريد اختبار
            </>
          )}
        </button>
      </div>
    </div>
  );
}

