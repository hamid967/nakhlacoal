import tm0 from '@/assets/trademarks/trademark-0.png';
import tm1 from '@/assets/trademarks/trademark-1.png';
import tm2 from '@/assets/trademarks/trademark-2.png';
import tm3 from '@/assets/trademarks/trademark-3.png';
import tm4 from '@/assets/trademarks/trademark-4.png';

export type Trademark = {
  id: string;
  registrationNo: string;
  nameAr: string;
  nameEn: string;
  niceClass: string;
  filedHijri: string;
  registeredHijri: string;
  expiresHijri: string;
  ownerAr: string;
  addressAr: string;
  countryAr: string;
  descriptionAr: string;
  goodsAr: string;
  colors: string[];
  image: string;
};

export const trademarks: Trademark[] = [
  {
    id: 'palm-charcoal',
    registrationNo: '143313025',
    nameAr: 'فحم النخلة',
    nameEn: 'Palm Charcoal',
    niceClass: 'الفئة 4',
    filedHijri: '1434/05/05',
    registeredHijri: '1443/11/28',
    expiresHijri: '1453/11/27',
    ownerAr: 'محمد عبدالله محمد باعشن',
    addressAr: 'ص.ب 10273، جدة 21433',
    countryAr: 'المملكة العربية السعودية',
    descriptionAr:
      'عبارة فحم النخلة بالعربية وعبارة Palm Charcoal بحروف لاتينية مع رسم نخلة بشكل خاص، بالألوان الأخضر والبني والأسود. لا تشمل الحماية كلمة "فحم" بالعربي وكلمة "Charcoal" باللاتيني.',
    goodsAr: 'الفحم',
    colors: ['#1A4A00', '#6B3A2A', '#0D0D0D'],
    image: tm0,
  },
  {
    id: 'nakhlan',
    registrationNo: '1436000025',
    nameAr: 'فحم نخلان',
    nameEn: 'Nakhlan Charcoal',
    niceClass: 'الفئة 4',
    filedHijri: '1436/04/08',
    registeredHijri: '1445/12/30',
    expiresHijri: '1455/12/29',
    ownerAr: 'مؤسسة محمد عبدالله محمد باعشن التجارية',
    addressAr: 'ص.ب 010273، جدة 21433',
    countryAr: 'المملكة العربية السعودية',
    descriptionAr:
      'رسم سعفات نخيل باللون الأخضر، وبجانبها عبارة "فحم نخلان" بحروف عربية، وأسفلها عبارة "Nakhlan Charcoal" بحروف لاتينية باللون الرمادي.',
    goodsAr: 'فحم، فحم إنثراسايت، قوالب فحم',
    colors: ['#2E7D32', '#8E8E8E', '#0D0D0D'],
    image: tm1,
  },
  {
    id: 'al-markaz',
    registrationNo: '1436001982',
    nameAr: 'فحم المركاز',
    nameEn: 'Al-Markaz Charcoal',
    niceClass: 'الفئة 4',
    filedHijri: '1436/05/05',
    registeredHijri: '1446/01/25',
    expiresHijri: '1456/01/25',
    ownerAr: 'مؤسسة محمد عبدالله محمد باعشن التجارية',
    addressAr: 'ص.ب 010273، جدة 21433',
    countryAr: 'المملكة العربية السعودية',
    descriptionAr:
      'بطاقة بالألوان الأسود والأحمر، بداخلها عبارة "فحم المركاز" بحروف عربية حمراء محددة بالأبيض، وأسفلها كلمة Al-Markaz بحروف لاتينية حمراء.',
    goodsAr: 'الفحم',
    colors: ['#B00020', '#0D0D0D', '#FFFFFF'],
    image: tm2,
  },
  {
    id: 'al-nakhlatain',
    registrationNo: '1441000830',
    nameAr: 'فحم النخلتين',
    nameEn: 'Al-Nakhlatain Coal',
    niceClass: 'الفئة 4',
    filedHijri: '1441/03/21',
    registeredHijri: '1441/01/01',
    expiresHijri: '1451/01/01',
    ownerAr: 'مؤسسة محمد عبدالله محمد باعشن التجارية',
    addressAr: 'ص.ب 010273، جدة 21433',
    countryAr: 'المملكة العربية السعودية',
    descriptionAr:
      'رسم نخلتين باللون الأخضر بينهما عبارة "فحم النخلتين" بحروف عربية، وأسفلها عبارة Al-Nakhlatain Coal بحروف لاتينية باللون الأسود.',
    goodsAr: 'زيوت وشحوم صناعية، وقود (بما في ذلك وقود المحركات)، مواد إضاءة، شموع وفتائل للإضاءة.',
    colors: ['#1A4A00', '#0D0D0D'],
    image: tm3,
  },
  {
    id: 'baashen',
    registrationNo: '1443003357',
    nameAr: 'باعشن',
    nameEn: 'Baashen',
    niceClass: 'الفئة 4',
    filedHijri: '1443/06/14',
    registeredHijri: '1443/01/22',
    expiresHijri: '1453/01/21',
    ownerAr: 'مؤسسة محمد عبدالله محمد باعشن التجارية',
    addressAr: 'ص.ب 010273، جدة 21433',
    countryAr: 'المملكة العربية السعودية',
    descriptionAr:
      'بطاقة باللون الأصفر بإطار باللون البني الغامق بداخلها كلمة "باعشن" بحروف عربية باللون الأزرق داخل شكل هندسي يعلوه رسم شعلة نار، وأسفلها مكعبات فحم باللون الأسود.',
    goodsAr: 'فحم، فحم [وقود]، فحم الكوك، قوالب الفحم الحجري القابلة للاشتعال، قوالب فحم',
    colors: ['#E8B923', '#3A1F0E', '#0B2B6B', '#0D0D0D'],
    image: tm4,
  },
];
