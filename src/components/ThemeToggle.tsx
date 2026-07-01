import { useEffect, useRef, useState } from 'react';
import { Palette, Check, RotateCcw, Monitor, Zap, Sparkles, Sun, Moon, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useReducedMotion, setReducedMotion } from '@/hooks/useReducedMotion';


type ThemeKey = 'auto' | 'emerald' | 'noir' | 'sand';
type FontKey = 'classic' | 'modern' | 'editorial' | 'tajawal' | 'cairo' | 'amiri';

const DEFAULT_THEME: ThemeKey = 'auto';
const DEFAULT_FONT: FontKey = 'classic';

const THEMES: Record<Exclude<ThemeKey, 'auto'>, { name: string; swatches: string[] }> = {
  emerald: { name: 'زمرد ملكي', swatches: ['#064e3b', '#c9a84c', '#f5f0e0'] },
  noir:    { name: 'فحم وذهب',  swatches: ['#0d0d0d', '#c9a84c', '#f0d78c'] },
  sand:    { name: 'رمل ونحاس', swatches: ['#8b5a2b', '#c97a3a', '#faf3e7'] },
};

const FONTS: Record<FontKey, { name: string; sample: string; cssFamily: string; googleHref?: string }> = {
  classic:   { name: 'كلاسيكي',  sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Reem Kufi','IBM Plex Sans Arabic','Cormorant Garamond',serif" },
  modern:    { name: 'عصري',     sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'IBM Plex Sans Arabic',system-ui,sans-serif" },
  editorial: { name: 'تحريري',   sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Cormorant Garamond',serif" },
  tajawal:   { name: 'تجول',     sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Tajawal',system-ui,sans-serif",
               googleHref: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap' },
  cairo:     { name: 'القاهرة',  sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Cairo',system-ui,sans-serif",
               googleHref: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap' },
  amiri:     { name: 'أميري',    sample: 'فحم النخلة · Palm Charcoal',  cssFamily: "'Amiri',serif",
               googleHref: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap' },
};

function ensureFontLoaded(f: FontKey) {
  const href = FONTS[f].googleHref;
  if (!href) return;
  const id = `pc-font-${f}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

const STORAGE_KEY = 'pc-theme';
const FONT_KEY = 'pc-font';
const HUE_KEY = 'pc-hue';
const DEFAULT_HUE = 158; // emerald

function resolveAuto(): Exclude<ThemeKey, 'auto'> {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'noir' : 'emerald';
}
function applyHue(h: number | null) {
  const root = document.documentElement;
  if (h === null) {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--accent');
    return;
  }
  // Apply as HSL tokens (project uses `hsl(var(--primary))`).
  root.style.setProperty('--primary', `${h} 78% 32%`);
  root.style.setProperty('--ring', `${h} 60% 45%`);
  root.style.setProperty('--accent', `${h} 55% 50%`);
}
function applyTheme(t: ThemeKey) {
  const eff = t === 'auto' ? resolveAuto() : t;
  document.documentElement.setAttribute('data-theme', eff);
}
function applyFont(f: FontKey) {
  ensureFontLoaded(f);
  document.documentElement.setAttribute('data-font', f);
  document.documentElement.style.setProperty('--pc-font-family', FONTS[f].cssFamily);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [font, setFont] = useState<FontKey>(DEFAULT_FONT);
  const [hue, setHue] = useState<number>(DEFAULT_HUE);
  const savedHueRef = useRef<number>(DEFAULT_HUE);
  const reduceMotion = useReducedMotion();


  useEffect(() => {
    const t = (localStorage.getItem(STORAGE_KEY) as ThemeKey) || DEFAULT_THEME;
    const f = (localStorage.getItem(FONT_KEY) as FontKey) || DEFAULT_FONT;
    const hRaw = localStorage.getItem(HUE_KEY);
    const h = hRaw ? Number(hRaw) : DEFAULT_HUE;
    setTheme(t); setFont(f); setHue(h);
    savedHueRef.current = h;
    applyTheme(t); applyFont(f);
    if (hRaw) applyHue(h);
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

  // Live preview: update CSS var without persisting.
  const previewHue = (h: number) => { setHue(h); applyHue(h); };
  const saveHue = () => { savedHueRef.current = hue; localStorage.setItem(HUE_KEY, String(hue)); };
  const cancelHuePreview = () => { setHue(savedHueRef.current); applyHue(localStorage.getItem(HUE_KEY) ? savedHueRef.current : null); };

  const reset = () => {
    pickTheme(DEFAULT_THEME);
    pickFont(DEFAULT_FONT);
    setHue(DEFAULT_HUE);
    savedHueRef.current = DEFAULT_HUE;
    localStorage.removeItem(HUE_KEY);
    applyHue(null);
  };

  const themeKeys: ThemeKey[] = ['auto', 'emerald', 'noir', 'sand'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="تخصيص الألوان والخطوط والثيم"
        title="الثيم · الألوان · الخطوط"
        className="relative w-10 h-10 rounded-full inline-flex items-center justify-center text-foreground/80 hover:text-gold-hi transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              'conic-gradient(from 0deg, #c9a84c, #064e3b, #8b5a2b, #f0d78c, #c9a84c)',
            padding: 1.5,
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'spin 8s linear infinite',
          }}
        />
        <span className="absolute inset-[3px] rounded-full bg-background/60 backdrop-blur-sm" aria-hidden="true" />
        <Palette className="relative w-4 h-4" />
        <Sparkles className="relative absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-gold animate-pulse" aria-hidden="true" />
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
        <DropdownMenuLabel className="text-xs">الحركة</DropdownMenuLabel>
        <button
          onClick={() => setReducedMotion(reduceMotion ? false : true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-right cursor-pointer"
          aria-pressed={reduceMotion}
        >
          <Zap className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="flex-1 text-sm">تقليل الحركة والتأثيرات</span>
          <span
            className={`inline-flex h-4 w-7 items-center rounded-full transition-colors ${
              reduceMotion ? 'bg-gold' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-background transition-transform ${
                reduceMotion ? 'translate-x-3.5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>

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
