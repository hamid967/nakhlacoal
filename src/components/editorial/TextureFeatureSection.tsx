import { useTranslation } from 'react-i18next';
import textureMacro from '@/assets/design/texture-macro.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { Eyebrow } from './primitives';

/**
 * القسم 7 — Texture Feature (شاشة عريضة)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.7
 */
export function TextureFeatureSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative bg-dark text-dark-foreground overflow-hidden">
      <div className="relative">
        <ResponsiveImage
          base="texture-macro"
          fallback={textureMacro}
          alt=""
          className="w-full h-[70vh] object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6" dir={isAr ? 'rtl' : 'ltr'}>
            <Eyebrow>Palm Carbon</Eyebrow>
            <h2
              className="font-editorial-bold leading-[0.9] text-dark-foreground mt-6"
              style={{ fontSize: 'clamp(56px, 12vw, 200px)' }}
            >
              {isAr ? (
                <>مادة عضوية <span className="italic text-gold">١٠٠٪</span></>
              ) : (
                <>100% <span className="italic text-gold">organic</span></>
              )}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TextureFeatureSection;
