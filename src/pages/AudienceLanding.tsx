import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { audienceBySlug, AUDIENCES } from '@/data/audiences';
import { products } from '@/data/products';
import { brand } from '@/lib/brand';
import { SEO } from '@/components/SEO';
import { trackConversion } from '@/lib/track';
import { Check, ArrowRight, MessageCircle } from 'lucide-react';

export default function AudienceLanding() {
  const { slug = '' } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const a = audienceBySlug(slug);
  if (!a) return <Navigate to="/" replace />;

  const featured = a.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean) as typeof products;

  const title = isAr ? a.titleAr : a.titleEn;
  const sub = isAr ? a.subAr : a.subEn;
  const bullets = isAr ? a.bulletsAr : a.bulletsEn;
  const faqs = isAr ? a.faqsAr : a.faqsEn;
  const cta = isAr ? a.ctaAr : a.ctaEn;
  const prefill = encodeURIComponent(isAr ? a.whatsappPrefillAr : a.whatsappPrefillEn);
  // Defensive: tolerate brand config without a contact/whatsapp field.
  const waBase =
    (brand as { footer?: { whatsapp?: string }; contact?: { whatsapp?: string } }).footer?.whatsapp ??
    (brand as { contact?: { whatsapp?: string } }).contact?.whatsapp ??
    '';
  const waHref = waBase ? `${waBase}?text=${prefill}` : '';

  if (import.meta.env.DEV && !waBase) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AudienceLanding] Missing WhatsApp link for "/for/${a.slug}". Set brand.footer.whatsapp or brand.contact.whatsapp in src/lib/brand.ts.`
    );
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div dir={dir} className="min-h-dvh bg-background text-foreground">
      <SEO
        title={isAr ? `${a.titleAr} | فحم النخلة` : `${a.titleEn} | Palm Charcoal`}
        description={sub}
        path={`/for/${a.slug}`}
        jsonLd={faqJsonLd}
      />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-primary mb-4 border-b border-primary/40 pb-1">
          {isAr ? a.badgeAr : a.badgeEn}
        </span>
        <h1 className="font-bold mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">{sub}</p>

        {import.meta.env.DEV && !waBase && (
          <div className="mt-4 inline-block rounded border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-destructive font-mono">
            DEV: WhatsApp link missing — set brand.footer.whatsapp
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversion('whatsapp_click', { source: `audience_${a.slug}` })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
            >
              <MessageCircle className="w-4 h-4" /> {cta}
            </a>
          )}
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-md font-semibold hover:bg-muted transition"
          >
            {isAr ? 'تحميل الكتالوج' : 'Download catalog'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Bullets */}
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid sm:grid-cols-2 gap-4">
          {bullets.map((b) => (
            <div key={b} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">
            {isAr ? 'منتجات مناسبة لك' : 'Products built for you'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p) => (
              <Link
                key={p.slug}
                to={`/products/${p.slug}`}
                className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={p.image}
                    alt={isAr ? p.nameAr : p.nameEn}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{isAr ? p.nameAr : p.nameEn}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {isAr ? p.descAr : p.descEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">
          {isAr ? 'أسئلة شائعة' : 'Frequently asked'}
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-lg border border-border bg-card p-4">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-primary group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {waHref && (
        <section className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-3">
            {isAr ? 'جاهز للبدء؟' : 'Ready to start?'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isAr
              ? 'تواصل مباشرة على واتساب وسنرسل لك عرض السعر خلال ساعة عمل.'
              : 'Message us on WhatsApp — we send your quote within one business hour.'}
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackConversion('whatsapp_click', { source: `audience_${a.slug}_footer` })}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold hover:opacity-90 transition"
          >
            <MessageCircle className="w-5 h-5" /> {cta}
          </a>
        </section>
      )}
    </div>
  );
}

export { AUDIENCES };
