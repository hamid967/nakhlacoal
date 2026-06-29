import { useState } from 'react';
import { Save, Building2, Bell, Palette, Globe2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="space-y-5">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>SYSTEM</p>
        <h1 className="a-display text-4xl mt-1">الإعدادات</h1>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr] gap-5">
        <nav className="a-card p-2 h-fit">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`a-nav-item w-full text-start ${tab === t.id ? 'active' : ''}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>

        <div className="a-card p-6">
          {tab === 'general' && (
            <Form onSave={() => toast.success('تم حفظ الإعدادات')}>
              <Field label="اسم الشركة" defaultValue="فحم النخلة — Palm Charcoal" />
              <Field label="المقر" defaultValue="جدة، المملكة العربية السعودية" />
              <Field label="جوال الأعمال" defaultValue="+966540060095" />
              <Field label="البريد" defaultValue="mab355@gmail.com" />
              <Field label="السجل التجاري" defaultValue="—" />
              <Field label="الرقم الضريبي" defaultValue="—" />
            </Form>
          )}
          {tab === 'theme' && <Placeholder text="إعدادات الثيم (Light/Dark + ألوان العلامة) — قريباً." />}
          {tab === 'notifications' && <Placeholder text="إشعارات البريد، واتساب، والمتصفح — قريباً." />}
          {tab === 'integrations' && <Placeholder text="WhatsApp Business API، البريد، التحليلات، الدفع — قريباً." />}
          {tab === 'security' && <Placeholder text="المصادقة الثنائية، الجلسات النشطة، سياسات كلمة المرور — قريباً." />}
        </div>
      </div>
    </div>
  );
}

function Form({ children, onSave }: { children: React.ReactNode; onSave: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
      <button className="a-btn a-btn-palm"><Save className="w-4 h-4" /> حفظ التغييرات</button>
    </form>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <div className="text-xs mb-1.5" style={{ color: 'var(--a-text-muted)' }}>{label}</div>
      <input className="a-input" defaultValue={defaultValue} />
    </label>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="text-center py-16" style={{ color: 'var(--a-text-muted)' }}>
      <div className="a-display text-2xl mb-2">قسم قيد التطوير</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
