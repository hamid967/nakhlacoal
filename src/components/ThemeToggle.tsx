import { useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type ThemeKey = 'emerald' | 'noir' | 'sand';
type FontKey = 'classic' | 'modern' | 'editorial';

const THEMES: Record<ThemeKey, { name: string; swatches: string[] }> = {
  emerald: { name: 'زمرد ملكي', swatches: ['#064e3b', '#c9a84c', '#f5f0e0'] },
  noir:    { name: 'فحم وذهب',  swatches: ['#0d0d0d', '#c9a84c', '#f0d78c'] },
  sand:    { name: 'رمل ونحاس', swatches: ['#8b5a2b', '#c97a3a', '#faf3e7'] },
};

const FONTS: Record<FontKey, { name: string; sample: string }> = {
  classic:   { name: 'كلاسيكي (تجوال)',  sample: 'Tajawal · Cormorant' },
  modern:    { name: 'عصري (IBM Plex)',  sample: 'IBM Plex Sans Arabic' },
  editorial: { name: 'تحريري (Amiri)',   sample: 'Amiri · Playfair' },
};

const STORAGE_KEY = 'pc-theme';
const FONT_KEY = 'pc-font';

function applyTheme(t: ThemeKey) {
  document.documentElement.setAttribute('data-theme', t);
}
function applyFont(f: FontKey) {
  document.documentElement.setAttribute('data-font', f);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeKey>('emerald');
  const [font, setFont] = useState<FontKey>('classic');

  useEffect(() => {
    const t = (localStorage.getItem(STORAGE_KEY) as ThemeKey) || 'emerald';
    const f = (localStorage.getItem(FONT_KEY) as FontKey) || 'classic';
    setTheme(t); setFont(f);
    applyTheme(t); applyFont(f);
  }, []);

  const pickTheme = (t: ThemeKey) => { setTheme(t); applyTheme(t); localStorage.setItem(STORAGE_KEY, t); };
  const pickFont = (f: FontKey) => { setFont(f); applyFont(f); localStorage.setItem(FONT_KEY, f); };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="تخصيص الألوان والخطوط"
        className="w-10 h-10 rounded-full inline-flex items-center justify-center text-foreground/70 hover:text-gold-hi hover:bg-gold/10 transition-all"
      >
        <Palette className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs">لوحة الألوان</DropdownMenuLabel>
        {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
          <DropdownMenuItem key={k} onClick={() => pickTheme(k)} className="flex items-center gap-2 cursor-pointer">
            <div className="flex gap-0.5">
              {THEMES[k].swatches.map((c) => (
                <span key={c} className="w-3 h-3 rounded-full border border-border" style={{ background: c }} />
              ))}
            </div>
            <span className="flex-1 text-sm">{THEMES[k].name}</span>
            {theme === k && <Check className="w-3.5 h-3.5 text-gold" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">الخطوط</DropdownMenuLabel>
        {(Object.keys(FONTS) as FontKey[]).map((k) => (
          <DropdownMenuItem key={k} onClick={() => pickFont(k)} className="flex items-center gap-2 cursor-pointer">
            <span className="flex-1 text-sm">
              {FONTS[k].name}
              <span className="block text-[10px] text-muted-foreground">{FONTS[k].sample}</span>
            </span>
            {font === k && <Check className="w-3.5 h-3.5 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
