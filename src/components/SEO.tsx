import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SITE = 'https://alnakhlacoal.com';

type PreloadImage = {
  href: string;
  type?: string;          // e.g. "image/avif"
  imageSrcSet?: string;   // responsive srcset string
  imageSizes?: string;    // sizes attr to match the <img>
  fetchPriority?: 'high' | 'low' | 'auto';
};

type Props = {
  title: string;
  description: string;
  path: string;
  jsonLd?: object;
  noindex?: boolean;
  image?: string;
  preloadImages?: PreloadImage[];
};


export function SEO({ title, description, path, jsonLd, noindex = false, image, preloadImages }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const cleanPath = path.startsWith('http') ? path : `${SITE}${path}`;
  const base = cleanPath.split('?')[0];
  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={cleanPath} />
      <link rel="alternate" hrefLang="ar" href={`${base}?lang=ar`} />
      <link rel="alternate" hrefLang="en" href={`${base}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={base} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={cleanPath} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image.startsWith('http') ? image : `${SITE}${image}`} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image.startsWith('http') ? image : `${SITE}${image}`} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      {preloadImages?.map((p, i) => (
        <link
          key={i}
          rel="preload"
          as="image"
          href={p.href}
          {...(p.type ? { type: p.type } : {})}
          {...(p.imageSrcSet ? { imagesrcset: p.imageSrcSet } : {})}
          {...(p.imageSizes ? { imagesizes: p.imageSizes } : {})}
          {...(p.fetchPriority ? { fetchPriority: p.fetchPriority } : {})}
        />
      ))}
    </Helmet>
  );
}
