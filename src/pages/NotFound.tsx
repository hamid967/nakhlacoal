import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  return (
    <section className="min-h-dvh flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="eyebrow justify-center mb-6">404</p>
        <h1 className={`text-5xl md:text-7xl mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
          {isAr ? 'صفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className="text-foreground/60 mb-10">
          {isAr ? 'الصفحة التي تبحث عنها قد نُقلت أو لم تعد متوفرة.' : 'The page you are looking for has moved or no longer exists.'}
        </p>
        <Link to="/" className="btn-gold">{t('nav.home')}</Link>
      </div>
    </section>
  );
}
