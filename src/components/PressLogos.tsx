import { useTranslation } from 'react-i18next';
import { Newspaper, Radio, Globe2, Building2, TrendingUp, BookOpen } from 'lucide-react';

const OUTLETS = [
  { name: 'Forbes', Icon: TrendingUp },
  { name: 'Bloomberg', Icon: Radio },
  { name: 'Arabian Business', Icon: Building2 },
  { name: 'Al-Eqtisadiah', Icon: Newspaper },
  { name: 'Reuters', Icon: Globe2 },
  { name: 'Gulf News', Icon: BookOpen },
];

export function PressLogos() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="relative z-0 isolate py-20 md:py-24 bg-[#0B0B0B] border-y border-white/5">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/70 font-arabic">
            {isAr ? 'كما ذُكرنا في' : 'As featured in'}
          </span>
        </div>
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 items-center"
          aria-label={isAr ? 'وسائل إعلام ذكرت العلامة' : 'Press mentions'}
        >
          {OUTLETS.map(({ name, Icon }) => (
            <li
              key={name}
              className="group flex items-center justify-center gap-2 text-white/40 hover:text-white/80 transition-colors"
              title={name}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="text-sm md:text-base tracking-wide font-medium">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
