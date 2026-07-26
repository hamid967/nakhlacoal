import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MessageCircle, FileText, ShieldCheck, Truck, Flame, Globe2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { LuxSection, SectionHeader } from '@/components/ui-lux';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PageHero } from '@/components/PageHero';

type Item = { q: string; a: string; cat: string };

export default function Faq() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('q-0');
  const [activeCat, setActiveCat] = useState<string>('all');

  const categories = isAr
    ? [
        { id: 'all', label: 'كل الأسئلة', icon: FileText },
        { id: 'product', label: 'المنتج والجودة', icon: Flame },
        { id: 'orders', label: 'الطلبات والشحن', icon: Truck },
        { id: 'wholesale', label: 'الجملة والتصدير', icon: Globe2 },
        { id: 'account', label: 'الحساب والفواتير', icon: ShieldCheck },
      ]
    : [
        { id: 'all', label: 'All questions', icon: FileText },
        { id: 'product', label: 'Product & quality', icon: Flame },
        { id: 'orders', label: 'Orders & shipping', icon: Truck },
        { id: 'wholesale', label: 'Wholesale & export', icon: Globe2 },
        { id: 'account', label: 'Account & billing', icon: ShieldCheck },
      ];

  const items: Item[] = useMemo(() => (isAr
    ? [
        { cat: 'product', q: 'ما الذي يميز فحم النخلة عن غيره؟', a: 'فحم طبيعي 100٪ من جذوع النخيل السعودي المُعتَّق، حرارة ثابتة تصل إلى 750°م، احتراق يدوم حتى 90 دقيقة، رماد أقل من 3٪، ودخان نقي دون رائحة كيميائية.' },
        { cat: 'product', q: 'هل الفحم مناسب للشيشة والمعسل؟', a: 'نعم — نوفّر مقاسات مكعبات (25 و26 مم) مضغوطة بضغط عالي، تشتعل خلال 3-4 دقائق وتدوم من 60 إلى 90 دقيقة دون طعم دخاني.' },
        { cat: 'product', q: 'ما القيمة الحرارية ونسبة الرطوبة؟', a: 'القيمة الحرارية بين 7,200 و7,800 كيلو كالوري/كجم، والرطوبة أقل من 6٪، والمواد المتطايرة أقل من 15٪. كل دفعة مختومة برقم مختبر داخلي.' },
        { cat: 'product', q: 'هل المنتج معتمد لتلامس الطعام؟', a: 'نعم — مطابق لمواصفات SASO والمعايير الدولية EN 1860-2 لفحم الشواء، وخالٍ من المواد المُسرِّعة للاشتعال.' },

        { cat: 'orders', q: 'كيف يمكنني الطلب أو طلب عرض سعر؟', a: 'استخدم صفحة /quote للحصول على سعر فوري، أو تواصل عبر واتساب 0540060085. عروض الجملة تُصدر خلال ساعة عمل واحدة.' },
        { cat: 'orders', q: 'ما مدة التوصيل داخل المملكة؟', a: 'داخل جدة ومكة: 24-48 ساعة. الرياض والدمام: 2-4 أيام عمل. باقي المدن: 3-5 أيام عمل عبر شركاء لوجستيين موثوقين.' },
        { cat: 'orders', q: 'هل هناك حد أدنى للطلب؟', a: 'التجزئة تبدأ من كرتون واحد (10 كجم). الجملة تبدأ من 500 كجم، والحاويات التصديرية من 20 طن.' },
        { cat: 'orders', q: 'ما طرق الدفع المتاحة؟', a: 'تحويل بنكي، مدى، Apple Pay، بطاقات ائتمانية، والدفع عند الاستلام لعملاء الشركات المعتمدين.' },

        { cat: 'wholesale', q: 'هل تقدمون خدمة التصدير خارج المملكة؟', a: 'نعم، نصدّر إلى دول الخليج، أوروبا، آسيا، وأمريكا الشمالية مع توثيق كامل: شهادة منشأ سعودية، Phytosanitary، Fumigation، وBill of Lading.' },
        { cat: 'wholesale', q: 'هل يمكنكم توفير علامة تجارية خاصة (Private Label)؟', a: 'نعم — نوفر تعبئة بعلامتك الخاصة (OEM/Private Label) من 5,000 كرتون فما فوق، بتصميم كامل ومطبوعات فاخرة.' },
        { cat: 'wholesale', q: 'ما شروط عقود التوريد الدورية للفنادق والمطاعم؟', a: 'عقود سنوية أو نصف سنوية بأسعار ثابتة، أولوية شحن، وفريق حساب مخصص. راجع /wholesale للتفاصيل.' },

        { cat: 'account', q: 'كيف أنشئ حساب عميل جملة؟', a: 'سجّل من /portal/login وسيقوم فريق المبيعات باعتماد حسابك خلال ساعات العمل، مع الوصول إلى الفواتير والطلبات وتتبع الشحنات.' },
        { cat: 'account', q: 'هل الفواتير متوافقة مع ZATCA؟', a: 'نعم — كل الفواتير إلكترونية بصيغة PDF مع QR Code متوافق مع المرحلة الثانية من فوترة هيئة الزكاة والضريبة والجمارك.' },
        { cat: 'account', q: 'كيف أتتبّع شحنتي؟', a: 'من داخل بوابة العميل /portal، ستجد رقم البوليصة وحالة الشحنة محدثة لحظياً عبر شركائنا اللوجستيين.' },
      ]
    : [
        { cat: 'product', q: 'What makes Palm Charcoal different?', a: '100% natural Saudi date-palm charcoal aged and slow-carbonized. Stable heat up to 750°C, burn time up to 90 minutes, ash below 3%, and clean smoke with no chemical odor.' },
        { cat: 'product', q: 'Is it suitable for hookah and shisha?', a: 'Yes — we offer high-density 25 & 26 mm cubes. Ignition in 3-4 minutes, burn time 60-90 minutes, and neutral taste that preserves flavor.' },
        { cat: 'product', q: 'What is the calorific value and moisture content?', a: 'Calorific value between 7,200-7,800 kcal/kg, moisture below 6%, and volatiles under 15%. Each batch is stamped with a lab reference number.' },
        { cat: 'product', q: 'Is the product food-safe?', a: 'Yes — complies with SASO and international EN 1860-2 standards for BBQ charcoal, and free from accelerants or binders.' },

        { cat: 'orders', q: 'How can I place an order or request a quote?', a: 'Use /quote for an instant estimate, or WhatsApp +966 540 060 095. Wholesale quotes are issued within one business hour.' },
        { cat: 'orders', q: 'What are delivery times inside Saudi Arabia?', a: 'Jeddah & Makkah: 24-48h. Riyadh & Dammam: 2-4 business days. Other cities: 3-5 days via trusted logistics partners.' },
        { cat: 'orders', q: 'Is there a minimum order quantity?', a: 'Retail starts at a single 10 kg carton. Wholesale from 500 kg, and export containers from 20 tons.' },
        { cat: 'orders', q: 'What payment methods do you accept?', a: 'Bank transfer, Mada, Apple Pay, major credit cards, and net terms for approved corporate accounts.' },

        { cat: 'wholesale', q: 'Do you export internationally?', a: 'Yes, we export to the GCC, Europe, Asia, and North America with full documentation: Saudi Certificate of Origin, Phytosanitary, Fumigation, and Bill of Lading.' },
        { cat: 'wholesale', q: 'Do you offer Private Label / OEM?', a: 'Yes — private-label packaging is available from 5,000 cartons and up, with full artwork and premium print finishing.' },
        { cat: 'wholesale', q: 'What are recurring supply terms for hotels and restaurants?', a: 'Annual or semi-annual contracts with locked pricing, shipment priority, and a dedicated account team. See /wholesale for details.' },

        { cat: 'account', q: 'How do I create a wholesale account?', a: 'Register at /portal/login; our sales team approves your account within business hours and grants access to invoices, orders, and shipment tracking.' },
        { cat: 'account', q: 'Are invoices ZATCA-compliant?', a: 'Yes — every invoice is issued as a PDF with a QR code compliant with Phase 2 of Saudi e-invoicing (ZATCA Fatoora).' },
        { cat: 'account', q: 'How do I track my shipment?', a: 'Log in to /portal to view the waybill number and live shipment status pushed from our logistics partners.' },
      ]
  ), [isAr]);

  const filtered = items.filter((it) => {
    const inCat = activeCat === 'all' || it.cat === activeCat;
    const q = query.trim().toLowerCase();
    const match = !q || it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q);
    return inCat && match;
  });

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };

  return (
    <>
      <SEO
        title={isAr ? 'الأسئلة الشائعة | فحم النخلة' : 'Frequently Asked Questions | Palm Charcoal'}
        description={isAr
          ? 'إجابات موثوقة حول فحم النخلة السعودي: الجودة، الشحن، أسعار الجملة، التصدير، عقود المطاعم والفنادق، الدفع، الفواتير الإلكترونية، والاعتمادات الدولية.'
          : 'Trusted answers about Palm Charcoal: quality, shipping, wholesale pricing, export, restaurant and hotel contracts, payments, ZATCA e-invoicing, and international certifications.'}
        path="/faq"
        jsonLd={faqJsonLd}
      />

      <PageHero
        eyebrow={isAr ? 'مركز المساعدة' : 'Help Center'}
        title={isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        subtitle={isAr
          ? 'كل ما تحتاج معرفته عن فحم النخلة — من المواصفات الفنية حتى شروط التصدير والفوترة الإلكترونية.'
          : 'Everything you need to know about Palm Charcoal — from technical specs to export terms and e-invoicing.'}
      />

      <LuxSection className="section">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-foreground/40" aria-hidden />
            <label htmlFor="faq-search" className="sr-only">
              {isAr ? 'ابحث في الأسئلة' : 'Search questions'}
            </label>
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? 'ابحث… (مثال: شحن، تصدير، فاتورة)' : 'Search… (e.g. shipping, export, invoice)'}
              className="w-full ps-12 pe-4 py-4 rounded-2xl border border-foreground/15 bg-background/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-jade/50 text-base"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label={isAr ? 'تصنيفات الأسئلة' : 'FAQ categories'}>
            {categories.map((c) => {
              const Icon = c.icon;
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCat(c.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    active
                      ? 'bg-jade text-background border-jade shadow-lg shadow-jade/20'
                      : 'bg-background/40 text-foreground/70 border-foreground/10 hover:border-jade/40'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Q&A list */}
          <SectionHeader
            eyebrow={isAr ? `${filtered.length} سؤال` : `${filtered.length} questions`}
            title={isAr ? 'إجابات مباشرة من فريقنا' : 'Straight answers from our team'}
          />

          <div>
            {filtered.length === 0 && (
              <p className="text-center text-foreground/60 py-10">
                {isAr ? 'لا توجد نتائج مطابقة. جرّب كلمة أخرى.' : 'No matching questions. Try another keyword.'}
              </p>
            )}
            {filtered.map((it, i) => {
              const id = `q-${items.indexOf(it)}`;
              const isOpen = openId === id;
              return (
                <ScrollReveal key={id} delay={Math.min(i * 40, 240)}>
                  <div className="border-t border-foreground/10">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : id)}
                      className="w-full text-start py-5 sm:py-6 flex items-start gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade/60 rounded-lg"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                    >
                      <span
                        className={`mt-1 shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          isOpen ? 'bg-jade text-background border-jade rotate-45' : 'border-foreground/15 text-jade group-hover:border-jade/50'
                        }`}
                        aria-hidden
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-base sm:text-lg font-semibold text-dark">{it.q}</span>
                        <span
                          id={`${id}-panel`}
                          role="region"
                          className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                          <span className="overflow-hidden">
                            <span className="block text-sm sm:text-base text-foreground/75 leading-relaxed pe-2">{it.a}</span>
                          </span>
                        </span>
                      </span>
                    </button>
                  </div>
                </ScrollReveal>
              );
            })}
            <div className="border-t border-foreground/10" />
          </div>

          {/* Still-need-help CTA */}
          <div className="mt-14 rounded-3xl border border-jade/20 bg-gradient-to-br from-jade/[0.06] via-background to-background p-8 sm:p-10 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-3">
              {isAr ? 'لم تجد إجابتك؟' : "Didn't find your answer?"}
            </h2>
            <p className="text-foreground/70 max-w-xl mx-auto mb-6">
              {isAr
                ? 'فريقنا جاهز للرد على استفساراتك خلال ساعات العمل عبر واتساب أو نموذج طلب عرض سعر.'
                : 'Our team is ready to respond during business hours via WhatsApp or a quote request form.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://wa.me/966540060085"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-jade text-background font-semibold hover:bg-jade/90 transition"
              >
                <MessageCircle className="w-4 h-4" aria-hidden />
                {isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
              </a>
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-foreground/20 text-dark font-semibold hover:border-jade/50 transition"
              >
                <FileText className="w-4 h-4" aria-hidden />
                {isAr ? 'اطلب عرض سعر' : 'Request a quote'}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-foreground/20 text-dark font-semibold hover:border-jade/50 transition"
              >
                {isAr ? 'صفحة التواصل' : 'Contact page'}
              </Link>
            </div>
          </div>
        </div>
      </LuxSection>
    </>
  );
}
