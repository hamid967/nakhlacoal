import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SITE = 'https://alnakhlacoal.com';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.jpg`;

type PreloadImage = {
  href: string;
  type?: string;
  imageSrcSet?: string;
  imageSizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
};

type BreadcrumbItem = { name: string; path: string };

type Props = {
  title: string;
  description: string;
  path: string;
  jsonLd?: object | object[];
  noindex?: boolean;
  image?: string;
  preloadImages?: PreloadImage[];
  breadcrumbs?: BreadcrumbItem[];
};

/**
 * Build a BreadcrumbList JSON-LD from a list of {name, path}.
 * The first item is always Home.
 */
export function buildBreadcrumbs(items: BreadcrumbItem[], homeName = 'الرئيسية') {
  const all = [{ name: homeName, path: '/' }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export function SEO({
  title,
  description,
  path,
  jsonLd,
  noindex = false,
  image,
  preloadImages,
  breadcrumbs,
}: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const cleanPath = path.startsWith('http') ? path : `${SITE}${path}`;
  const base = cleanPath.split('?')[0];
  const imageUrl = image
    ? (image.startsWith('http') ? image : `${SITE}${image}`)
    : DEFAULT_OG_IMAGE;

  const schemas: object[] = [];
  if (jsonLd) {
    if (Array.isArray(jsonLd)) schemas.push(...jsonLd);
    else schemas.push(jsonLd);
  }
  if (breadcrumbs && breadcrumbs.length) {
    schemas.push(buildBreadcrumbs(breadcrumbs, lang === 'ar' ? 'الرئيسية' : 'Home'));
  }

  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={base} />
      <link rel="alternate" hrefLang="ar" href={`${base}?lang=ar`} />
      <link rel="alternate" hrefLang="en" href={`${base}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={base} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={base} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
      {preloadImages?.map((p, i) => (
        <link
          key={`pre-${i}`}
          rel="preload"
          as="image"
          href={p.href}
          {...(p.type ? { type: p.type } : {})}
          {...(p.imageSrcSet ? { imagesrcset: p.imageSrcSet } : {})}
          {...(p.imageSizes ? { imagesizes: p.imageSizes } : {})}
          {...(p.fetchPriority ? ({ fetchpriority: p.fetchPriority } as any) : {})}
        />
      ))}
    </Helmet>
  );
}
