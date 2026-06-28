import productBbq from '@/assets/product-bbq.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productLump from '@/assets/product-lump.jpg';
import productBox from '@/assets/product-box.jpg';

export type ProductSpec = {
  burn: string;
  ash: string;
  carbon: string;
  moisture: string;
  heat: string;
  packaging: string;
};

export type Product = {
  slug: string;
  image: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  descAr: string;
  descEn: string;
  featuresAr: string[];
  featuresEn: string[];
  useCasesAr: string[];
  useCasesEn: string[];
  specs: ProductSpec;
};

export const products: Product[] = [
  {
    slug: 'bbq',
    image: productBbq,
    nameAr: 'فحم الشواء',
    nameEn: 'BBQ Charcoal',
    taglineAr: 'مثالي للشواء والرحلات',
    taglineEn: 'Perfect for grilling and outings',
    descAr: 'فحم شواء طبيعي فاخر يمنحك حرارة عالية وثابتة لفترة طويلة، مع رماد أقل ودون أي روائح مزعجة، مثالي للمناسبات العائلية والرحلات البرية.',
    descEn: 'Premium natural BBQ charcoal delivering high, steady heat for hours with minimal ash and no off-odors. Built for family gatherings and outdoor escapes.',
    featuresAr: ['احتراق طويل +3 ساعات', 'حرارة ثابتة 700°C', 'بدون رائحة', 'سهل الإشعال'],
    featuresEn: ['3+ hour burn', 'Steady 700°C heat', 'Odor-free', 'Easy to light'],
    useCasesAr: ['شواء عائلي', 'رحلات برية', 'مناسبات خارجية'],
    useCasesEn: ['Family BBQ', 'Outdoor trips', 'Backyard events'],
    specs: { burn: '+3h', ash: '<3%', carbon: '85%', moisture: '<6%', heat: '700°C+', packaging: '5 / 10 / 15 kg' },
  },
  {
    slug: 'coconut',
    image: productCoconut,
    nameAr: 'فحم جوز الهند',
    nameEn: 'Coconut Charcoal',
    taglineAr: 'صديق للبيئة - احتراق أطول',
    taglineEn: 'Eco-friendly, longer burn',
    descAr: 'فحم مصنوع من قشور جوز الهند بكثافة عالية، يتميز برماد أقل وزمن احتراق طويل، خيار مستدام صديق للبيئة بجودة استثنائية.',
    descEn: 'High-density charcoal pressed from coconut shells. Exceptionally low ash, long burn, and a sustainable footprint without compromising quality.',
    featuresAr: ['نسبة كربون 88%', 'رماد منخفض جداً', 'مستدام بيئياً', 'حرارة ممتازة'],
    featuresEn: ['88% carbon content', 'Ultra-low ash', 'Sustainable', 'Excellent heat'],
    useCasesAr: ['شواء فاخر', 'مطاعم', 'استخدام تجاري'],
    useCasesEn: ['Premium grilling', 'Restaurants', 'Commercial use'],
    specs: { burn: '+2h', ash: '<2%', carbon: '88%', moisture: '<5%', heat: '650°C+', packaging: '1 / 5 / 10 kg' },
  },
  {
    slug: 'hookah',
    image: productHookah,
    nameAr: 'فحم المعسل',
    nameEn: 'Hookah Charcoal',
    taglineAr: 'لا يغير طعم المعسل',
    taglineEn: 'Preserves shisha flavor',
    descAr: 'مكعبات فحم نقية مصممة خصيصاً للشيشة، تشتعل بسرعة وتحافظ على طعم المعسل الأصلي دون أي روائح أو طعم دخيل.',
    descEn: 'Pure charcoal cubes engineered for shisha. Quick ignition and a clean, neutral burn that preserves the natural molasses flavor.',
    featuresAr: ['اشتعال سريع', 'بدون طعم دخيل', 'مكعبات منتظمة', 'دخان نظيف'],
    featuresEn: ['Quick ignition', 'Flavor-neutral', 'Uniform cubes', 'Clean smoke'],
    useCasesAr: ['مقاهي شيشة', 'استخدام منزلي', 'مناسبات خاصة'],
    useCasesEn: ['Shisha lounges', 'Home use', 'Private events'],
    specs: { burn: '90 min', ash: '<1.5%', carbon: '90%', moisture: '<4%', heat: '600°C', packaging: '1 kg cubes' },
  },
  {
    slug: 'compressed',
    image: productLump,
    nameAr: 'الفحم المضغوط',
    nameEn: 'Compressed Charcoal',
    taglineAr: 'كثافة عالية - حرارة قوية',
    taglineEn: 'High density, strong heat',
    descAr: 'قوالب فحم مضغوطة بكثافة استثنائية تمنحك أطول زمن احتراق وحرارة قوية متواصلة، مناسبة للمطاعم والفنادق والاستخدام الكثيف.',
    descEn: 'Densely pressed charcoal blocks offering the longest burn time and sustained high heat. Built for restaurants, hotels, and heavy use.',
    featuresAr: ['احتراق +4 ساعات', 'كثافة عالية', 'حرارة قوية', 'اقتصادي للمطاعم'],
    featuresEn: ['4+ hour burn', 'High density', 'Strong heat', 'Cost-effective for HoReCa'],
    useCasesAr: ['مطاعم', 'فنادق', 'استخدام تجاري كثيف'],
    useCasesEn: ['Restaurants', 'Hotels', 'Heavy commercial use'],
    specs: { burn: '+4h', ash: '<3%', carbon: '86%', moisture: '<6%', heat: '750°C+', packaging: '10 kg blocks' },
  },
  {
    slug: 'export',
    image: productBox,
    nameAr: 'علبة التصدير الفاخرة',
    nameEn: 'Premium Export Box',
    taglineAr: 'تغليف فاخر للتصدير',
    taglineEn: 'Luxury export packaging',
    descAr: 'علبة فاخرة قابلة للتخصيص بعلامتك التجارية، مصممة للأسواق الفاخرة العالمية مع خيارات تغليف متعددة وحاويات تصدير كاملة.',
    descEn: 'A luxury, customizable retail box designed for premium global markets with private-label options and full container exports.',
    featuresAr: ['تخصيص العلامة التجارية', 'تغليف فاخر', 'جاهز للتصدير', 'حاويات 20/40 قدم'],
    featuresEn: ['Private label', 'Luxury packaging', 'Export-ready', '20/40 ft containers'],
    useCasesAr: ['التصدير العالمي', 'متاجر فاخرة', 'فنادق 5 نجوم'],
    useCasesEn: ['Global export', 'Premium retail', '5-star hotels'],
    specs: { burn: 'Mixed', ash: '<3%', carbon: '85%+', moisture: '<6%', heat: '700°C+', packaging: '20 / 40 ft container' },
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
