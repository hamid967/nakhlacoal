import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  description: string;
  path: string;
  jsonLd?: object;
};

export function SEO({ title, description, path, jsonLd }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={path} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={path} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
