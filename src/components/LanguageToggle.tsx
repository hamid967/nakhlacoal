import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={`group inline-flex items-center gap-2 rounded-full border-luxe transition-all duration-500 hover:border-luxe-strong ${
        compact ? 'px-3 py-1.5' : 'px-4 py-2'
      } text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-hi`}
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="font-body">{isAr ? 'EN' : 'عربي'}</span>
    </button>
  );
}
