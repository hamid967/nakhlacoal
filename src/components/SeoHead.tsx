import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SITE = 'https://starlight-echoes.lovable.app';

interface Props {
  title?: string;
  description?: string;
  noindex?: boolean;
}

/**
 * Renders canonical, hreflang (ar/en/x-default) and optional noindex.
 * Use ?lang=ar|en convention for hreflang alternates.
 */
export function SeoHead({ title, description, noindex = false }: Props) {
  const { pathname, search } = useLocation();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const canonical = `${SITE}${cleanPath}${search}`;
  const arHref = `${SITE}${cleanPath}?lang=ar`;
  const enHref = `${SITE}${cleanPath}?lang=en`;

  return (
    <Helmet>
      <html lang={isAr ? 'ar' : 'en'} dir={isAr ? 'rtl' : 'ltr'} />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={arHref} />
      <link rel="alternate" hrefLang="en" href={enHref} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE}${cleanPath}`} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
    </Helmet>
  );
}
