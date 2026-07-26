import { SEO } from '@/components/SEO';
import { BrokenGridHome } from '@/components/editorial/BrokenGridHome';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';

export default function Home() {
  return (
    <>
      <SEO
        title="فحم النخلة | Palm Charcoal — فحم سعودي فاخر"
        description="فحم النخلة السعودي الفاخر — كربنة نقية، احتراق طويل، رماد شبه معدوم. من نخيل الجزيرة العربية إلى موائد العالم."
        path="/"
      />
      <h1 className="sr-only">فحم النخلة | Palm Charcoal — Premium Saudi Charcoal</h1>
      <BrokenGridHome />
      <StickyMobileCTA />
    </>
  );
}

