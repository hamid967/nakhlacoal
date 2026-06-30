// Audience-specific landing page content (P2 plan).
// Each persona drives /for/:slug with tailored copy, products, and CTAs.

export type Audience = {
  slug: 'restaurants' | 'shisha-lounges' | 'wholesalers' | 'importers';
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
  productSlugs: string[]; // matches src/data/products.ts slugs
  bulletsAr: string[];
  bulletsEn: string[];
  faqsAr: { q: string; a: string }[];
  faqsEn: { q: string; a: string }[];
  ctaAr: string;
  ctaEn: string;
  whatsappPrefillAr: string;
  whatsappPrefillEn: string;
};

export const AUDIENCES: Audience[] = [
  {
    slug: 'restaurants',
    badgeAr: 'للمطاعم والفنادق',
    badgeEn: 'For Restaurants & Hotels',
    titleAr: 'فحم شواء احترافي لمطاعم الستيك واللحوم',
    titleEn: 'Professional BBQ charcoal for steakhouses and grills',
    subAr: 'عيار ثابت، اشتعال نظيف بدون شرر، رماد أقل من 4٪ — مناسب للمطابخ المفتوحة وغرف الشواء.',
    subEn: 'Consistent caliber, clean ignition with no sparks, ash under 4% — built for open kitchens and grill rooms.',
    productSlugs: ['bbq', 'compressed'],
    bulletsAr: [
      'توريد أسبوعي مجدول إلى مطبخك',
      'فاتورة ضريبية معتمدة + شهادة منشأ',
      'تغليف 10/15 كجم لسهولة المناولة',
      'حد أدنى منخفض للطلب يبدأ من 50 كجم',
    ],
    bulletsEn: [
      'Scheduled weekly delivery to your kitchen',
      'VAT invoice + certificate of origin',
      '10/15 kg packaging for easy handling',
      'Low MOQ starting at 50 kg',
    ],
    faqsAr: [
      { q: 'هل توفرون عقود توريد شهرية؟', a: 'نعم، نوقّع عقود سنوية بأسعار مثبّتة وجداول تسليم أسبوعية.' },
      { q: 'ما مدة الاشتعال؟', a: 'يعطي فحم الشواء حرارة ثابتة لمدة 90-120 دقيقة بعد الاشتعال الكامل.' },
    ],
    faqsEn: [
      { q: 'Do you offer monthly supply contracts?', a: 'Yes, we sign annual contracts with locked pricing and weekly delivery schedules.' },
      { q: 'How long does it burn?', a: 'Our BBQ charcoal delivers stable heat for 90-120 minutes after full ignition.' },
    ],
    ctaAr: 'اطلب عرض سعر للمطاعم',
    ctaEn: 'Get a restaurant quote',
    whatsappPrefillAr: 'مرحباً، أنا من مطعم وأرغب بعرض سعر فحم شواء.',
    whatsappPrefillEn: 'Hello, I represent a restaurant and need a BBQ charcoal quote.',
  },
  {
    slug: 'shisha-lounges',
    badgeAr: 'لمقاهي ومحلات الشيشة',
    badgeEn: 'For Shisha Lounges & Cafés',
    titleAr: 'فحم جوز الهند للمعسل — حرارة هادئة وبدون رائحة',
    titleEn: 'Coconut shisha charcoal — quiet heat, zero odor',
    subAr: 'مكعبات 25×25 و26×26 ملم، اشتعال خلال 8 دقائق، يدوم 90 دقيقة على رأس واحدة، رماد أبيض ناعم.',
    subEn: '25×25 and 26×26 mm cubes, ignites in 8 minutes, lasts 90 minutes per head, fine white ash.',
    productSlugs: ['coconut', 'hookah'],
    bulletsAr: [
      'بدون رائحة، بدون شرر',
      'مكعبات متجانسة لتشغيل أسرع',
      'عبوات 1 كجم و10 كجم',
      'خصومات تراكمية على الكميات',
    ],
    bulletsEn: [
      'No odor, no sparks',
      'Uniform cubes for faster service',
      '1 kg and 10 kg packs',
      'Tiered volume discounts',
    ],
    faqsAr: [
      { q: 'كم يدوم المكعب الواحد؟', a: 'كل مكعب 26×26 ملم يحافظ على حرارة الرأس لمدة 90 دقيقة في المتوسط.' },
      { q: 'هل يصلح للتصدير؟', a: 'نعم، التغليف معتمد للتصدير ويحمل بيانات اللوت ورقم الإنتاج.' },
    ],
    faqsEn: [
      { q: 'How long does one cube last?', a: 'Each 26×26 mm cube holds the bowl heat for ~90 minutes on average.' },
      { q: 'Is it export-ready?', a: 'Yes, packaging is export-certified with lot and batch numbers printed.' },
    ],
    ctaAr: 'احجز عينة للمحل',
    ctaEn: 'Reserve a lounge sample',
    whatsappPrefillAr: 'مرحباً، أنا من مقهى شيشة وأرغب بعينة وعرض سعر معسل.',
    whatsappPrefillEn: 'Hello, I run a shisha lounge and would like a sample and quote.',
  },
  {
    slug: 'wholesalers',
    badgeAr: 'لتجار الجملة',
    badgeEn: 'For Wholesalers',
    titleAr: 'فحم بالجملة بأسعار قاعدة المصنع',
    titleEn: 'Bulk charcoal at factory-floor pricing',
    subAr: 'أسعار طبقات تبدأ من 1,000 كجم — تسليم على شاحنتك من مستودع جدة، فاتورة ضريبية مفصّلة.',
    subEn: 'Tiered pricing starting at 1,000 kg — pickup from our Jeddah warehouse, itemized VAT invoice.',
    productSlugs: ['bbq', 'coconut', 'compressed'],
    bulletsAr: [
      'سعر تفضيلي بدءاً من 1,000 كجم',
      'تحميل خلال 24 ساعة',
      'تغليف خاص بعلامتك (Private Label)',
      'دعم تسويقي: صور ومواصفات وكتالوج',
    ],
    bulletsEn: [
      'Tier pricing from 1,000 kg up',
      'Loading within 24 hours',
      'Private label packaging available',
      'Marketing support: photos, specs, catalog',
    ],
    faqsAr: [
      { q: 'هل يوجد سعر خاص للتجار الدائمين؟', a: 'نعم، نمنح ائتمان 30 يوم وأسعار سنوية مثبتة للشركاء الدائمين.' },
      { q: 'هل تقدمون Private Label؟', a: 'نعم، نطبع علامتك على الأكياس بحد أدنى 5,000 كجم.' },
    ],
    faqsEn: [
      { q: 'Any pricing for repeat traders?', a: 'Yes — 30-day credit and annual locked pricing for ongoing partners.' },
      { q: 'Do you offer private label?', a: 'Yes, your brand printed on bags from a 5,000 kg minimum.' },
    ],
    ctaAr: 'طلب قائمة أسعار الجملة',
    ctaEn: 'Request wholesale price list',
    whatsappPrefillAr: 'مرحباً، أنا تاجر جملة وأرغب بقائمة أسعار الكميات.',
    whatsappPrefillEn: 'Hello, I am a wholesaler and would like the bulk price list.',
  },
  {
    slug: 'importers',
    badgeAr: 'للمستوردين الدوليين',
    badgeEn: 'For International Importers',
    titleAr: 'تصدير فحم سعودي بشروط FOB / CIF',
    titleEn: 'Saudi charcoal exports on FOB / CIF terms',
    subAr: 'حاويات 20 و40 قدم من ميناء جدة الإسلامي، وثائق كاملة (CO, Phytosanitary, MSDS)، تعبئة بحرية معتمدة.',
    subEn: '20ft and 40ft containers from Jeddah Islamic Port, full docs (CO, Phytosanitary, MSDS), sea-ready packing.',
    productSlugs: ['coconut', 'bbq'],
    bulletsAr: [
      'إنتاج 20 طن أسبوعياً',
      'شروط FOB Jeddah أو CIF حسب الميناء',
      'دفع L/C أو T/T (30٪ مقدماً)',
      'فحص جودة طرف ثالث (SGS) متاح',
    ],
    bulletsEn: [
      '20-ton weekly production capacity',
      'FOB Jeddah or CIF terms available',
      'Payment via L/C or T/T (30% advance)',
      'Third-party QC (SGS) available',
    ],
    faqsAr: [
      { q: 'ما الحد الأدنى للحاوية؟', a: 'حاوية 20 قدم = 18 طن، حاوية 40 قدم = 26 طن صافي.' },
      { q: 'هل تصدّرون إلى الاتحاد الأوروبي؟', a: 'نعم، شحنات منتظمة إلى ألمانيا وفرنسا وهولندا.' },
    ],
    faqsEn: [
      { q: 'Minimum container quantity?', a: '20ft = 18 tons, 40ft = 26 tons net.' },
      { q: 'Do you ship to the EU?', a: 'Yes, regular shipments to Germany, France, and the Netherlands.' },
    ],
    ctaAr: 'طلب عرض سعر تصدير',
    ctaEn: 'Request export quotation',
    whatsappPrefillAr: 'Hello, I am an importer and need an FOB/CIF quotation for a container.',
    whatsappPrefillEn: 'Hello, I am an importer and need an FOB/CIF quotation for a container.',
  },
];

export const audienceBySlug = (slug: string) => AUDIENCES.find((a) => a.slug === slug);
