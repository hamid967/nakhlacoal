import { useTranslation } from 'react-i18next';
import { Check, GitCompare } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

type Props = {
  slug: string;
  className?: string;
};

export function CompareToggle({ slug, className = '' }: Props) {
  const { has, toggle, isFull } = useCompare();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const active = has(slug);
  const disabled = !active && isFull;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) toggle(slug);
      }}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs uppercase tracking-[0.15em] transition-all border ${
        active
          ? 'bg-gold text-background border-gold'
          : 'border-luxe text-foreground/70 hover:border-luxe-strong hover:text-gold-hi'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      aria-pressed={active}
    >
      {active ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
      {active ? (isAr ? 'تمت الإضافة' : 'Added') : (isAr ? 'قارن' : 'Compare')}
    </button>
  );
}
