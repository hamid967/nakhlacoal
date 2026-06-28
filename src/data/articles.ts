// Long-form articles. Top 3 carry full SEO content; the rest are stubs (coming soon).

export type Article = {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  date: string;
  readMin: number;
  category: string;
  keywords: string[];
  // Markdown-like sections (rendered as headings + paragraphs)
  contentAr?: { h: string; p: string }[];
  contentEn?: { h: string; p: string }[];
};

export const articles: Article[] = [
  {
    id: 'shisha-charcoal-guide',
    titleAr: 'كيف تختار أفضل فحم معسل؟ 7 معايير يجهلها أغلب الناس',
    titleEn: 'How to Choose the Best Hookah Charcoal — 7 Criteria Most People Miss',
    excerptAr: 'دليل تفصيلي لمعايير الاختيار، المقاسات، مدة الاحتراق، نسبة الرماد، والرائحة، مع مقارنة بين الأنواع الشائعة.',
    excerptEn: 'A detailed guide to selection criteria, sizes, burn time, ash ratio, and aroma — with a comparison of common charcoal types.',
    date: '2025-02-04',
    readMin: 7,
    category: 'فحم المعسل',
    keywords: ['فحم معسل', 'أفضل فحم للشيشة', 'فحم جوز الهند', 'فحم النخلة'],
    contentAr: [
      { h: 'لماذا يصنع نوع الفحم فرقاً جوهرياً في الجلسة؟', p: 'الفحم هو من يُحدِّد حرارة التبغ وثبات الطعم خلال الجلسة. اختيار النوع الخاطئ يؤدي إلى احتراق سريع، طعم محروق، أو حرارة منخفضة لا تُخرج نكهة المعسل. الفحم الطبيعي من جوز الهند المضغوط هو المعيار الذهبي عالمياً اليوم.' },
      { h: 'المعيار 1: المادة الخام', p: 'تجنّب الفحم سريع الإشعال للمعسل لأنه يحتوي على نترات البوتاسيوم ومركبات كيميائية تؤثر على الطعم والصحة. الأفضل دائماً فحم قشر جوز الهند الطبيعي 100% — احتراق نظيف، بلا رائحة، وثبات حرارة مثالي.' },
      { h: 'المعيار 2: مدة الاحتراق', p: 'الفحم الجيد يحترق 75–90 دقيقة على الأقل. أقل من ذلك يعني كثافة منخفضة أو ضغط ضعيف. فحم النخلة يحقق 90 دقيقة بشكل ثابت في اختبارات المختبر الداخلي.' },
      { h: 'المعيار 3: درجة الحرارة القصوى', p: 'النطاق الأمثل بين 700–800°م. أقل من 650°م لا يكفي لتبخير الجلسرين في المعسل، وأعلى من 850°م يحرق التبغ. اطلب من المورّد بيانات DSC أو سجلات اختبار حقيقية.' },
      { h: 'المعيار 4: نسبة الرماد', p: 'كلما قلّت نسبة الرماد، زادت جودة الفحم. الفحم الفاخر يبقى تحت 3%. الرماد العالي يعني خامة منخفضة وحشو غير محترق.' },
      { h: 'المعيار 5: المقاس المناسب', p: 'المقاسات الشائعة: 22mm للقرّاع المخصّص، 25mm للجلسات القصيرة، 26×26mm للجلسات الطويلة. الفحم بأبعاد غير منتظمة يوزّع الحرارة بشكل سيء.' },
      { h: 'المعيار 6: الرائحة قبل الإشعال', p: 'فحم جودة عالية لا رائحة له. أي رائحة كيميائية أو زيتية = حشو أو مواد ربط رديئة. اشمّ الكرتون قبل الشراء.' },
      { h: 'المعيار 7: الشهادات والاختبارات', p: 'اطلب شهادة SASO أو ISO 9001 أو تقرير مختبر طرف ثالث. مورّد محترم يُقدّم الأرقام ويرحّب بزيارة المصنع.' },
      { h: 'الخلاصة', p: 'تطبيق هذه المعايير السبعة يضمن لك جلسة ثابتة الحرارة، طعم نظيف، وعمر شيشة أطول. فحم النخلة مصنوع وفق هذه المعايير من 2010، ومنتجاتنا تخضع لاختبار مختبر داخلي لكل دفعة.' },
    ],
    contentEn: [
      { h: 'Why charcoal choice changes your session', p: 'Charcoal determines tobacco heat and flavor stability. The wrong type causes fast burn, burnt flavor, or insufficient heat. 100% pressed coconut shell charcoal is today\'s global gold standard.' },
      { h: '1. Raw material', p: 'Avoid quick-light charcoal for shisha — it contains potassium nitrate and chemicals that affect taste and health. Stick to 100% natural coconut shell charcoal.' },
      { h: '2. Burn time', p: 'Quality charcoal burns 75–90 minutes minimum. Palm Charcoal hits 90 minutes consistently in our lab tests.' },
      { h: '3. Peak temperature', p: 'Optimal range: 700–800°C. Below 650°C is too cold; above 850°C burns tobacco.' },
      { h: '4. Ash ratio', p: 'Premium charcoal stays below 3% ash. Higher means low-grade material or filler.' },
      { h: '5. Size', p: 'Common sizes: 22mm, 25mm, 26×26mm. Irregular dimensions distribute heat poorly.' },
      { h: '6. Pre-light smell', p: 'High-quality charcoal is odorless. Any chemical or oily smell means poor binders.' },
      { h: '7. Certificates', p: 'Ask for SASO, ISO 9001, or third-party lab reports.' },
      { h: 'Conclusion', p: 'Applying these seven criteria guarantees a stable, clean session. Palm Charcoal has been built around them since 2010.' },
    ],
  },
  {
    id: 'incense-charcoal-guide',
    titleAr: 'فحم البخور سريع الإشعال — الدليل الكامل للاستخدام الصحيح',
    titleEn: 'Quick-Light Incense Charcoal — The Complete Usage Guide',
    excerptAr: 'كيف تشعل فحم البخور بأمان، الفرق بينه وبين الفحم العادي، أفضل الممارسات، والاحتياطات الصحية.',
    excerptEn: 'How to safely light incense charcoal, differences vs regular charcoal, best practices, and health precautions.',
    date: '2025-03-12',
    readMin: 5,
    category: 'فحم البخور',
    keywords: ['فحم بخور سريع الاشتعال', 'فحم عود', 'فحم البخور الصيني'],
    contentAr: [
      { h: 'ما هو فحم البخور سريع الإشعال؟', p: 'هو قرص فحم مضغوط مع طبقة خفيفة من مُسرّع الإشعال، يشتعل خلال 8–12 ثانية بمجرد ملامسة اللهب. مصمّم خصيصاً للعود والبخور واللبان.' },
      { h: 'الفرق عن فحم المعسل', p: 'فحم البخور يحترق أسرع (15–25 دقيقة) وبحرارة أعلى لإطلاق العطر بسرعة. فحم المعسل يُصمَّم للاحتراق البطيء (90 دقيقة) لتبخير جلسرين التبغ.' },
      { h: 'طريقة الإشعال الآمنة', p: '1) أمسك القرص بملقط معدني. 2) قرّب اللهب من حافة واحدة. 3) انتظر حتى تنتشر الشرارة الحمراء عبر القرص بالكامل (30–45 ثانية). 4) ضعه في حامل البخور المخصّص. 5) ضع البخور فوقه بعد رؤية القرص يتحوّل لرمادي خفيف.' },
      { h: 'الاحتياطات', p: 'استخدم في مكان جيد التهوية. لا تستخدم اليد المجرّدة. لا تشعل قرصين متجاورين. أبعد عن الأطفال والمواد القابلة للاشتعال. لا تستخدم فحم البخور في الشيشة أو الشواء.' },
      { h: 'كم قرصاً تحتاج للجلسة؟', p: 'قرص واحد يكفي لـ 3–5 ملاعق صغيرة من العود أو 2–3 قطع لبان لمدة 20 دقيقة عطر مستمر.' },
      { h: 'لماذا فحم النخلة الصيني درجة أولى', p: 'مصنوع من نشارة خشب الزان عالي الكثافة، مضغوط بسماكة موحّدة لضمان توزيع حرارة متساوي وعدم تفتّت القرص أثناء الاحتراق.' },
    ],
    contentEn: [
      { h: 'What is quick-light incense charcoal?', p: 'A compressed charcoal disc with a thin accelerant coat that ignites in 8–12 seconds. Designed for oud, bakhoor, and frankincense.' },
      { h: 'Vs hookah charcoal', p: 'Incense charcoal burns faster (15–25 min) at higher heat to release fragrance quickly. Hookah charcoal burns slowly (90 min).' },
      { h: 'Safe lighting', p: 'Hold disc with metal tongs, apply flame to one edge, wait for red spark to spread fully (30–45s), place in burner, add incense once disc turns light grey.' },
      { h: 'Precautions', p: 'Well-ventilated area only. Never use bare hands. Keep away from children and flammables. Not for shisha or BBQ.' },
      { h: 'How many discs?', p: 'One disc covers 3–5 teaspoons of oud or 2–3 frankincense pieces for ~20 minutes of fragrance.' },
      { h: 'Why our Grade-A Chinese discs', p: 'Made from dense beech sawdust, compressed to uniform thickness for even heat and zero crumbling.' },
    ],
  },
  {
    id: 'natural-vs-pressed',
    titleAr: 'الفحم الطبيعي مقابل الفحم المضغوط — أيهما أفضل لك؟',
    titleEn: 'Natural vs Pressed Charcoal — Which is Better for You?',
    excerptAr: 'مقارنة علمية بين الفحم الطبيعي والمضغوط من حيث الحرارة، المدة، الرماد، والاستخدامات الأنسب.',
    excerptEn: 'A scientific comparison: natural vs pressed charcoal in heat, duration, ash, and best uses.',
    date: '2025-04-20',
    readMin: 6,
    category: 'مقارنات',
    keywords: ['فحم طبيعي', 'فحم مضغوط', 'فحم شواء', 'BBQ charcoal'],
    contentAr: [
      { h: 'تعريف سريع', p: 'الفحم الطبيعي = قطع خشب مكربنة بدون إضافات. الفحم المضغوط = مسحوق فحم مع مادة ربط (نشأ، صمغ طبيعي أحياناً) مضغوط في أشكال هندسية.' },
      { h: 'جدول المقارنة', p: 'الحرارة: طبيعي 600–700°م، مضغوط 750–800°م. المدة: طبيعي 45–60 دقيقة، مضغوط 90–120 دقيقة. الرماد: طبيعي 5–7%، مضغوط 3% أو أقل. الرائحة: طبيعي خشبي طفيف، مضغوط محايد.' },
      { h: 'متى تختار الطبيعي؟', p: 'للشواء السريع، اللحوم البيضاء، الجلسات القصيرة، وإذا كنت تفضّل نكهة خشبية تقليدية.' },
      { h: 'متى تختار المضغوط؟', p: 'للجلسات الطويلة (الشيشة 90 دقيقة، أو شواء بطيء)، عند الحاجة لحرارة ثابتة، وفي البيئات المغلقة بسبب قلّة الرماد والدخان.' },
      { h: 'الجودة لا النوع', p: 'الفرق الحقيقي ليس في النوع بل في الجودة: مادة خام نقيّة، تكربن بدرجة حرارة صحيحة، وضغط بكثافة عالية. فحم مضغوط رديء أسوأ من طبيعي ممتاز، والعكس صحيح.' },
      { h: 'توصياتنا', p: 'لفحم المعسل: مضغوط جوز الهند طبيعي 100%. للبخور: مضغوط درجة أولى مع مُسرّع إشعال آمن. للشواء: مزيج من الاثنين حسب نوع الطعام.' },
    ],
    contentEn: [
      { h: 'Quick definition', p: 'Natural = carbonized wood pieces, no additives. Pressed = charcoal powder + binder, compressed into geometric shapes.' },
      { h: 'Comparison', p: 'Heat: natural 600–700°C, pressed 750–800°C. Duration: natural 45–60 min, pressed 90–120 min. Ash: natural 5–7%, pressed ≤3%.' },
      { h: 'When natural?', p: 'Quick BBQ, white meat, short sessions, traditional woody flavor.' },
      { h: 'When pressed?', p: 'Long sessions (hookah, slow BBQ), need for stable heat, indoor due to low ash/smoke.' },
      { h: 'Quality over type', p: 'The real difference is quality: pure raw material, correct carbonization temperature, high-density pressing.' },
      { h: 'Our recommendations', p: 'Hookah: 100% natural coconut pressed. Incense: Grade-A pressed with safe accelerant. BBQ: mix as needed.' },
    ],
  },
  {
    id: 'why-natural-charcoal',
    titleAr: 'لماذا الفحم الطبيعي أفضل؟',
    titleEn: 'Why is Natural Charcoal Better?',
    excerptAr: 'الفحم الطبيعي يحترق أطول، حرارته أعلى، ولا يحتوي على مواد كيميائية.',
    excerptEn: 'Natural charcoal burns longer, hotter, and contains no chemicals.',
    date: '2025-01-12', readMin: 5, category: 'الجودة',
    keywords: ['فحم طبيعي', 'فحم سعودي'],
  },
  {
    id: 'bbq-tips',
    titleAr: 'أسرار الشواء الاحترافي بفحم النخلة',
    titleEn: 'Pro BBQ Tips with Palm Charcoal',
    excerptAr: 'من توزيع الجمر إلى ضبط الحرارة — نصائح يستخدمها أمهر الطباخين.',
    excerptEn: 'From ember distribution to heat control — tips from master grillers.',
    date: '2025-03-21', readMin: 7, category: 'الشواء',
    keywords: ['فحم شواء', 'BBQ'],
  },
  {
    id: 'export-quality',
    titleAr: 'كيف نضمن الجودة في كل شحنة تصدير؟',
    titleEn: 'How We Guarantee Quality in Every Export Shipment',
    excerptAr: 'نظرة داخل عمليات ضبط الجودة لدينا قبل خروج كل حاوية.',
    excerptEn: 'Inside our quality control before every container leaves.',
    date: '2025-04-08', readMin: 4, category: 'التصدير',
    keywords: ['تصدير فحم', 'charcoal export'],
  },
  {
    id: 'oud-incense',
    titleAr: 'فن استخدام الفحم مع العود والبخور',
    titleEn: 'The Art of Using Charcoal with Oud and Incense',
    excerptAr: 'الفحم المناسب يبرز رائحة العود ويطيل أمد الجلسة.',
    excerptEn: 'The right charcoal enhances oud aroma and extends the session.',
    date: '2025-05-15', readMin: 5, category: 'البخور',
    keywords: ['عود', 'بخور'],
  },
  {
    id: 'storage',
    titleAr: 'تخزين الفحم: نصائح لإطالة العمر والجودة',
    titleEn: 'Storing Charcoal: Tips to Extend Life and Quality',
    excerptAr: 'الرطوبة عدو الفحم. كيف تحافظ على جودة كل قطعة.',
    excerptEn: 'Moisture is charcoal\'s enemy. How to preserve quality.',
    date: '2025-06-02', readMin: 4, category: 'إرشادات',
    keywords: ['تخزين فحم'],
  },
];

export const getArticle = (id: string) => articles.find((a) => a.id === id);
