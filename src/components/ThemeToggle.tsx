import { useEffect, useState } from 'react';
import { Palette, Check, RotateCcw, Monitor, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useReducedMotion, setReducedMotion } from '@/hooks/useReducedMotion';


type ThemeKey = 'auto' | 'emerald' | 'noir' | 'sand';
type FontKey = 'classic' | 'modern' | 'editorial';

const DEFAULT_THEME: ThemeKey = 'auto';
const DEFAULT_FONT: FontKey = 'classic';

const THEMES: Record<Exclude<ThemeKey, 'auto'>, { name: string; swatches: string[] }> = {
  emerald: { name: 'زمرد ملكي', swatches: ['#064e3b', '#c9a84c', '#f5f0e0'] },
  noir:    { name: 'فحم وذهب',  swatches: ['#0d0d0d', '#c9a84c', '#f0d78c'] },
  sand:    { name: 'رمل ونحاس', swatches: ['#8b5a2b', '#c97a3a', '#faf3e7'] },
};

const FONTS: Record<FontKey, { name: string; sample: string; cssFamily: string }> = {
  classic:   { name: 'كلاسيكي',  sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Tajawal','Cormorant Garamond',serif" },
  modern:    { name: 'عصري',     sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'IBM Plex Sans Arabic','IBM Plex Sans',sans-serif" },
  editorial: { name: 'تحريري',   sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Amiri','Playfair Display',serif" },
};

const STORAGE_KEY = 'pc-theme';
const FONT_KEY = 'pc-font';

function resolveAuto(): Exclude<ThemeKey, 'auto'> {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'noir' : 'emerald';
}
function applyTheme(t: ThemeKey) {
  const eff = t === 'auto' ? resolveAuto() : t;
  document.documentElement.setAttribute('data-theme', eff);
}
function applyFont(f: FontKey) {
  document.documentElement.setAttribute('data-font', f);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [font, setFont] = useState<FontKey>(DEFAULT_FONT);
  const reduceMotion = useReducedMotion();


  useEffect(() => {
    const t = (localStorage.getItem(STORAGE_KEY) as ThemeKey) || DEFAULT_THEME;
    const f = (localStorage.getItem(FONT_KEY) as FontKey) || DEFAULT_FONT;
    setTheme(t); setFont(f);
    applyTheme(t); applyFont(f);
  }, []);

  // Re-apply on system change while in auto
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const pickTheme = (t: ThemeKey) => { setTheme(t); applyTheme(t); localStorage.setItem(STORAGE_KEY, t); };
  const pickFont  = (f: FontKey)  => { setFont(f);  applyFont(f);  localStorage.setItem(FONT_KEY, f); };

  const reset = () => {
    pickTheme(DEFAULT_THEME);
    pickFont(DEFAULT_FONT);
  };

  const themeKeys: ThemeKey[] = ['auto', 'emerald', 'noir', 'sand'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="تخصيص الألوان والخطوط"
        className="w-10 h-10 rounded-full inline-flex items-center justify-center text-foreground/70 hover:text-gold-hi hover:bg-gold/10 transition-all"
      >
        <Palette className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <DropdownMenuLabel className="text-xs px-0">لوحة الألوان</DropdownMenuLabel>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-gold transition"
          >
            <RotateCcw className="w-3 h-3" /> إعادة تعيين
          </button>
        </div>

        {themeKeys.map((k) => {
          const isAuto = k === 'auto';
          const meta = isAuto ? null : THEMES[k];
          return (
            <button
              key={k}
              onClick={() => pickTheme(k)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-right cursor-pointer"
            >
              {isAuto ? (
                <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <div className="flex gap-0.5">
                  {meta!.swatches.map((c) => (
                    <span key={c} className="w-3 h-3 rounded-full border border-border" style={{ background: c }} />
                  ))}
                </div>
              )}
              <span className="flex-1 text-sm">
                {isAuto ? 'تلقائي (نظام التشغيل)' : meta!.name}
              </span>
              {theme === k && <Check className="w-3.5 h-3.5 text-gold" />}
            </button>
          );
        })}

        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuLabel className="text-xs">الخطوط</DropdownMenuLabel>

        {(Object.keys(FONTS) as FontKey[]).map((k) => (
          <button
            key={k}
            onClick={() => pickFont(k)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-right cursor-pointer"
          >
            <span className="flex-1">
              <span className="block text-sm" style={{ fontFamily: FONTS[k].cssFamily }}>
                {FONTS[k].sample}
              </span>
              <span className="block text-[10px] text-muted-foreground">{FONTS[k].name}</span>
            </span>
            {font === k && <Check className="w-3.5 h-3.5 text-gold" />}
          </button>
        ))}

        <DropdownMenuSeparator className="my-2" />
        <div className="px-2 py-2 rounded-md bg-muted/40 border border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">معاينة فورية</div>
          <div className="text-sm text-foreground">فحم النخلة — جودة فاخرة</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold text-dark font-semibold">CTA</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-dark text-background">Primary</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] border border-gold text-gold">Outline</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
