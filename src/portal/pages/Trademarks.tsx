import { trademarks } from '@/data/trademarks';

export default function PortalTrademarks() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · TRADEMARKS</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">العلامات التجارية</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
          مجموعة العلامات المسجّلة رسمياً لمصنع فحم النخلة في المملكة العربية السعودية.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {trademarks.map((t) => (
          <div key={t.id} className="a-card a-card-hover p-5">
            <div className="aspect-square rounded-xl grid place-items-center mb-4"
                 style={{ background: 'var(--a-surface-2)' }}>
              <img decoding="async" loading="lazy" src={t.image} alt={t.nameAr} className="max-w-[70%] max-h-[70%] object-contain" />
            </div>
            <h3 className="a-display text-xl">{t.nameAr}</h3>
            <p className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{t.nameEn}</p>
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between"><dt style={{ color: 'var(--a-text-muted)' }}>رقم التسجيل</dt><dd className="font-mono">{t.registrationNo}</dd></div>
              <div className="flex justify-between"><dt style={{ color: 'var(--a-text-muted)' }}>الفئة</dt><dd>{t.niceClass}</dd></div>
              <div className="flex justify-between"><dt style={{ color: 'var(--a-text-muted)' }}>تنتهي</dt><dd>{t.expiresHijri}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
