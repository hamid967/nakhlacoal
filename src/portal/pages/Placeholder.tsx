import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PortalPlaceholder({ title }: { title?: string }) {
  const { pathname } = useLocation();
  const name = title ?? pathname.split('/').pop() ?? 'صفحة';
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · PORTAL</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">{name}</h1>
      </header>
      <div className="a-card p-10 text-center">
        <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto"
             style={{ background: 'var(--a-surface-2)', color: 'var(--a-gold)' }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="a-display text-2xl mt-4">قريباً</h3>
        <p className="text-sm mt-2" style={{ color: 'var(--a-text-muted)' }}>
          نعمل على تجهيز هذه الصفحة لتتكامل مع منظومة فحم النخلة. يمكنك متابعة طلباتك من قائمة "طلباتي" حالياً.
        </p>
      </div>
    </div>
  );
}
