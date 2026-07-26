import { useTranslation } from 'react-i18next';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { LocationSection } from '@/components/LocationSection';
import { brand } from '@/lib/brand';

export default function Location() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://alnakhlacoal.com/location#business',
    name: isAr ? 'فحم النخلة — Palm Charcoal' : 'Palm Charcoal',
    image: 'https://alnakhlacoal.com/og-image.png?v=20260726',
    url: 'https://alnakhlacoal.com/location',
    telephone: brand.footer.phone,
    email: brand.footer.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: isAr ? 'سوق الفحم، البلد' : 'Charcoal Souq, Al-Balad',
      addressLocality: isAr ? 'جدة' : 'Jeddah',
      postalCode: '21433',
      addressRegion: isAr ? 'مكة المكرمة' : 'Makkah Province',
      addressCountry: 'SA',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 21.4858, longitude: 39.1925 },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '23:00',
      },
    ],
    sameAs: [brand.social.instagram, brand.social.x, brand.social.tiktok, brand.social.linkedin],
    areaServed: ['SA', 'AE', 'KW', 'BH', 'QA', 'OM'],
  };

  return (
    <>
      <SEO
        title={isAr ? 'موقعنا | فحم النخلة — سوق الفحم، البلد، جدة' : 'Our Location | Palm Charcoal — Charcoal Souq, Jeddah'}
        description={
          isAr
            ? 'زورونا في سوق الفحم بحي البلد التاريخي في جدة. العنوان، ساعات العمل، الهاتف، البريد، والخريطة.'
            : 'Visit Palm Charcoal at the historic Charcoal Souq in Al-Balad, Jeddah. Address, hours, phone, email, and map.'
        }
        path="/location"
        jsonLd={localBusinessJsonLd}
      />
      <PageHero
        number="16"
        eyebrow={isAr ? 'الموقع' : 'Location'}
        title={isAr ? 'زورونا في سوق الفحم — جدة' : 'Visit us at Charcoal Souq — Jeddah'}
        subtitle={
          isAr
            ? 'مقرنا في قلب البلد التاريخي. العنوان الموحّد، ساعات العمل، والاتصال المباشر — كلها هنا.'
            : 'Our headquarters in the heart of historic Al-Balad. Unified NAP, hours, and direct contact — all in one place.'
        }
      />
      <LocationSection />
    </>
  );
}
