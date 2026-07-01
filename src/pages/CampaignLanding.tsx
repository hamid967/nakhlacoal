import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { brand } from '@/lib/brand';
import { trackConversion as track } from '@/lib/track';

type Campaign = {
  slug: 'grill' | 'shisha' | 'wholesale';
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  sub: string;
  bullets: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  socialProof: string;
  faq: { q: string; a: string }[];
};

const CAMPAIGNS: Record<string, Campaign> = {
  grill: {
    slug: 'grill',
    title: 'فحم شواء فاخر',
    metaTitle: 'فحم شواء فاخر — فحم النخلة | توصيل جدة والمملكة',
    metaDescription:
      'فحم نخيل سعودي طبيعي 100% للشواء — حرارة عالية، احتراق طويل، بدون شرر أو دخان. اطلب الآن عبر واتساب.',
    headline: 'شواء بمذاق الاحتراف — فحم نخيل سعودي طبيعي',
    sub: 'حرارة ثابتة حتى 4 ساعات • بدون شرر • بدون رائحة كيميائية • معتمد للشواية والمطاعم.',
    bullets: [
      'حرارة عالية ومستقرة لشواء اللحوم والدجاج والمأكولات البحرية',
      'احتراق طويل يصل إلى 4 ساعات لكل وجبة شوي',
      'بدون شرر ولا انفجارات — آمن لجلسات العائلة',
      'مصدر طبيعي 100% من خشب النخيل السعودي المستدام',
      'توصيل سريع داخل جدة وشحن لجميع مدن المملكة',
    ],
    primaryCta: { label: 'اطلب عبر واتساب الآن', href: brand.footer.whatsapp },
    secondaryCta: { label: 'تصفّح منتجات الشواء', href: '/products?use=grill' },
    socialProof: 'يستخدمه أكثر من 200 مطعم ومشواة في المملكة.',
    faq: [
      { q: 'كم مدة احتراق الكيس الواحد؟', a: 'من 3 إلى 4 ساعات حسب نوع الشواية والكمية.' },
      { q: 'هل التوصيل متاح خارج جدة؟', a: 'نعم، نشحن لجميع مدن المملكة خلال 2–4 أيام عمل.' },
      { q: 'ما الحد الأدنى للطلب؟', a: 'لا يوجد حد أدنى للأفراد. للمطاعم يبدأ من 50 كجم بأسعار جملة.' },
    ],
  },
  shisha: {
    slug: 'shisha',
    title: 'فحم شيشة معسّل جوز الهند',
    metaTitle: 'فحم شيشة جوز الهند الفاخر — فحم النخلة',
    metaDescription:
      'فحم شيشة من قشور جوز الهند الطبيعي — جمر طويل، بدون رماد متطاير، بدون رائحة، يحافظ على نكهة المعسّل.',
    headline: 'جلسة شيشة بنكهة نقية — جمر يدوم 90 دقيقة',
    sub: 'مكعبات جوز هند مضغوطة بدقة • اشتعال سريع • رماد منخفض • صفر تأثير على نكهة المعسّل.',
    bullets: [
      'جمر مستقر يدوم حتى 90 دقيقة بدون استبدال',
      'مكعبات بقياس موحّد 25×25 ملم — مثالية لكل أنواع الرؤوس',
      'رماد قليل جداً ولا يتطاير على المنضدة',
      'بدون كبريت أو روائح كيميائية — يحفظ نكهة التبغ كما هي',
      'تغليف محكم يحمي من الرطوبة لفترات طويلة',
    ],
    primaryCta: { label: 'اطلب كرتون شيشة', href: brand.footer.whatsapp },
    secondaryCta: { label: 'مواصفات فحم الشيشة', href: '/products?use=shisha' },
    socialProof: 'الخيار الرسمي لأكثر من 80 لاونج في الخليج.',
    faq: [
      { q: 'كم مكعب في الكيلو؟', a: 'تقريباً 72 مكعب 25mm في الكيلو الواحد.' },
      { q: 'هل يصلح للفحامة الكهربائية؟', a: 'نعم، يشتعل خلال 5–7 دقائق على الفحامة العادية.' },
      { q: 'هل لديكم أسعار جملة للمحلات؟', a: 'نعم، اطلب الكتالوج الكامل عبر واتساب لأسعار التاجر.' },
    ],
  },
  wholesale: {
    slug: 'wholesale',
    title: 'فحم بالجملة للموزعين',
    metaTitle: 'فحم بالجملة — أسعار الموزع | فحم النخلة جدة',
    metaDescription:
      'فحم نخيل سعودي بالجملة للمطاعم والمحلات والموزعين. أسعار مدرّجة، MOQ منخفض، فاتورة ضريبية، تسليم منتظم.',
    headline: 'شريك التوريد الموثوق — فحم بالجملة من المنبع',
    sub: 'أسعار موزع رسمية • فاتورة ضريبية 15% • شحن أسبوعي • عقود تفضيلية للكميات الكبيرة.',
    bullets: [
      'حد أدنى للطلب يبدأ من 500 كجم فقط',
      'تدرّج أسعار حسب الكمية — وفّر حتى 28%',
      'فاتورة ضريبية معتمدة لجميع طلبات الشركات',
      'جدول تسليم أسبوعي ثابت داخل جدة، الرياض، الدمام',
      'إمكانية التغليف باسم علامتك التجارية (Private Label)',
    ],
    primaryCta: { label: 'احصل على عرض الموزع', href: brand.footer.whatsapp },
    secondaryCta: { label: 'تحميل الكتالوج', href: '/catalog' },
    socialProof: 'نورّد لأكثر من 350 منشأة تجارية في المملكة والخليج.',
    faq: [
      { q: 'ما شروط الدفع؟', a: 'تحويل بنكي مقدّم أو NET-15 للعملاء المعتمدين بعد ثالث طلبية.' },
      { q: 'هل يمكنني زيارة المستودع؟', a: 'نعم، زيارات المستودع متاحة بموعد مسبق في حي الميناء، جدة.' },
      { q: 'هل تقدمون OEM/تغليف خاص؟', a: 'نعم، من 2000 كجم نطبع تصميمك على الأكياس بحد أدنى للإنتاج.' },
    ],
  },
};

export default function CampaignLanding() {
  const { slug = '' } = useParams();
  const c = CAMPAIGNS[slug];

  useEffect(() => {
    if (!c) return;
    // Generic + per-campaign named events for clean GA4/GTM reporting
    track('campaign_lp_view', { campaign: c.slug, page_location: typeof window !== 'undefined' ? window.location.href : '' });
    track(`lp_${c.slug}_view`, { campaign: c.slug });
  }, [c]);

  if (!c) return <Navigate to="/" replace />;

  const url = `https://alnakhlacoal.com/lp/${c.slug}`;

  const fireCta = (kind: 'primary' | 'secondary', label: string, href: string) => {
    const channel = href.includes('wa.me') || href.includes('whatsapp')
      ? 'whatsapp'
      : href.startsWith('tel:') ? 'phone'
      : href.startsWith('mailto:') ? 'email'
      : 'internal';
    const props = { campaign: c.slug, cta: kind, label, channel, destination: href };
    // Generic event (one row per campaign in GA4 / GTM)
    track('campaign_cta_click', props);
    // Per-campaign named event, e.g. lp_grill_cta_whatsapp
    track(`lp_${c.slug}_cta_${channel}`, props);
    if (channel === 'whatsapp') track('whatsapp_click', { source: `lp_${c.slug}_${kind}` });
  };

  const onPrimary = () => fireCta('primary', c.primaryCta.label, c.primaryCta.href);
  const onSecondary = () => fireCta('secondary', c.secondaryCta.label, c.secondaryCta.href);

  return (
    <>
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDescription} />
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: c.faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <div dir="rtl" className="min-h-dvh bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-background" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-6 section">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              فحم النخلة · {c.title}
            </p>
            <h1 className="font-serif">{c.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">{c.sub}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={c.primaryCta.href}
                target={c.primaryCta.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                onClick={onPrimary}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
              >
                {c.primaryCta.label}
              </a>
              <Link
                to={c.secondaryCta.href}
                onClick={onSecondary}
                className="inline-flex items-center justify-center rounded-full border border-border bg-card/60 px-8 py-4 text-base font-semibold backdrop-blur transition hover:bg-card"
              >
                {c.secondaryCta.label}
              </Link>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">★★★★★ {c.socialProof}</p>
          </div>
        </section>

        {/* Bullets */}
        <section className="mx-auto max-w-6xl px-6 section-tight">
          <h2 className="mb-10 font-serif text-3xl md:text-4xl">لماذا {c.title}؟</h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {c.bullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-base leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Mid CTA */}
        <section className="border-y border-border/40 bg-card/40">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl">جاهز للطلب؟</h3>
              <p className="mt-2 text-muted-foreground">
                تواصل معنا الآن — رد خلال 15 دقيقة في ساعات العمل (9ص – 11م).
              </p>
            </div>
            <a
              href={c.primaryCta.href}
              target="_blank"
              rel="noreferrer"
              onClick={onPrimary}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg"
            >
              {c.primaryCta.label}
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 section-tight">
          <h2 className="mb-8 font-serif text-3xl">أسئلة شائعة</h2>
          <div className="space-y-4">
            {c.faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur"
              >
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="text-primary">›</span> {f.q}
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Trust footer */}
        <section className="border-t border-border/40 bg-background">
          <div className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-muted-foreground">
            <p>فحم النخلة · {brand.footer.address}</p>
            <p className="mt-1">
              {brand.footer.phone} · {brand.footer.email}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
