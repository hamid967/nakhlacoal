import { Phone, Mail, MessageCircle, Headphones, BookOpen, MessageSquare } from 'lucide-react';

const channels = [
  { icon: MessageCircle, label: 'واتساب', value: '+966 54 006 0085', href: 'https://wa.me/966540060085', tint: 'green' },
  { icon: Phone, label: 'هاتف', value: '+966 54 006 0085', href: 'tel:+966540060085', tint: 'blue' },
  { icon: Mail, label: 'البريد', value: 'nakhlacoal@gmail.com', href: 'mailto:nakhlacoal@gmail.com', tint: 'gold' },
  { icon: Headphones, label: 'الدعم الفني', value: 'متاح من 9ص — 9م', href: 'https://wa.me/966540060085?text=الدعم%20الفني', tint: 'violet' },
  { icon: MessageSquare, label: 'شكوى/اقتراح', value: 'نستقبل ملاحظاتك', href: 'mailto:nakhlacoal@gmail.com?subject=شكوى', tint: 'rose' },
  { icon: BookOpen, label: 'مركز المعرفة', value: 'مقالات ودلائل', href: '/knowledge', tint: 'amber' },
];

export default function PortalSupport() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · SUPPORT</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">الدعم الفني</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
          فريقنا جاهز لمساعدتك. اختر القناة الأنسب لك.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {channels.map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="a-card a-card-hover p-5 block">
            <div className={`a-pill a-pill-${c.tint} w-10 h-10 grid place-items-center`}>
              <c.icon className="w-5 h-5" />
            </div>
            <h3 className="a-display text-xl mt-3">{c.label}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>{c.value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
