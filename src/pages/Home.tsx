import { SEO } from '@/components/SEO';
import { BrokenGridHome } from '@/components/editorial/BrokenGridHome';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';

export default function Home() {
  return (
    <>
      <SEO
        titleKey="seo.home.title"
        descriptionKey="seo.home.description"
        canonical="https://alnakhlacoal.com/"
      />
      <h1 className="sr-only">فحم النخلة | Palm Charcoal — Premium Saudi Charcoal</h1>
      <BrokenGridHome />
      <StickyMobileCTA />
    </>
  );
}
