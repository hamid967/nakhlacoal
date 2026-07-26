import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SeoHead } from '@/components/SeoHead';

type Props = {
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  updatedAt: string; // ISO date
  children: ReactNode;
};

export function LegalPage({ slug, titleAr, titleEn, descAr, descEn, updatedAt, children }: Props) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const title = isAr ? titleAr : titleEn;
  const desc = isAr ? descAr : descEn;
  const date = new Date(updatedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-[70vh] bg-[hsl(var(--background))]" dir={isAr ? 'rtl' : 'ltr'}>
      <SeoHead title={`${title} | ${isAr ? 'فحم النخلة' : 'Palm Charcoal'}`} description={desc} />
      <article className="container max-w-3xl py-16 px-4">
        <header className="mb-10 border-b border-[hsl(var(--gold-hi)/0.2)] pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--gold-hi))]">
            {isAr ? 'وثيقة قانونية' : 'Legal document'}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-display text-[hsl(var(--foreground))]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            {isAr ? 'آخر تحديث:' : 'Last updated:'} <time dateTime={updatedAt}>{date}</time>
          </p>
        </header>
        <div className="prose prose-neutral dark:prose-invert max-w-none legal-body">
          {children}
        </div>
        <footer className="mt-16 pt-6 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
          {isAr
            ? 'هذه الوثيقة تديرها شركة فحم النخلة للإجابة عن الأسئلة الشائعة المتعلقة بمنتجاتنا وخدماتنا. لا تُعتبر بديلاً عن الاستشارة القانونية.'
            : 'This document is maintained by Palm Charcoal to answer common questions about our products and services. It is not a substitute for professional legal advice.'}
        </footer>
      </article>
    </div>
  );
}
