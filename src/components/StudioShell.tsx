import { useState, type ReactNode } from 'react';
import {
  Layers, Plus, Palette, Image as ImageIcon, Grid3x3, Wand2,
  Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, Rocket,
  ChevronRight, Settings2, Sparkles,
} from 'lucide-react';
import { useDir } from '@/components/ui-lux';

/**
 * StudioShell — a Wix Studio 2024-inspired editor chrome that wraps page content
 * as a "canvas". Purely visual: no editor functionality. Frames the marketing
 * content in a dark, bold, modern editor UI.
 */
export function StudioShell({ children, pageName }: { children: ReactNode; pageName?: string }) {
  const { isAr } = useDir();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const rail = [
    { icon: Layers,     label: isAr ? 'الصفحات' : 'Pages' },
    { icon: Plus,       label: isAr ? 'إضافة' : 'Add' },
    { icon: Palette,    label: isAr ? 'التصميم' : 'Design' },
    { icon: ImageIcon,  label: isAr ? 'الوسائط' : 'Media' },
    { icon: Grid3x3,    label: isAr ? 'التطبيقات' : 'Apps' },
    { icon: Wand2,      label: isAr ? 'الذكاء' : 'AI' },
  ];

  const canvasMax =
    device === 'mobile' ? 'max-w-[420px]' :
    device === 'tablet' ? 'max-w-[900px]' :
    'max-w-none';

  return (
    <div className="min-h-screen bg-[#0b0b10] text-[#e7e7ee]" dir="ltr">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-12 flex items-center gap-3 px-3 border-b border-white/10 bg-[#0f0f16]/95 backdrop-blur">
        <div className="flex items-center gap-2 pe-3 border-e border-white/10 h-full">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center text-[10px] font-black text-black">ن</div>
          <span className="text-[13px] font-semibold tracking-tight">Palm Studio</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-[12px] text-white/60">
          <span>alnakhlacoal.com</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/90">{pageName || 'Home'}</span>
        </nav>

        <div className="flex-1" />

        {/* Device switcher */}
        <div className="flex items-center bg-white/5 rounded-md p-0.5 border border-white/10">
          {([
            [Monitor, 'desktop'],
            [Tablet, 'tablet'],
            [Smartphone, 'mobile'],
          ] as const).map(([Icon, key]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`w-8 h-7 grid place-items-center rounded transition ${
                device === key ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
              }`}
              aria-label={key}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Undo/Redo */}
        <div className="hidden sm:flex items-center gap-1 text-white/50">
          <button className="w-8 h-7 grid place-items-center rounded hover:bg-white/10 hover:text-white"><Undo2 className="w-3.5 h-3.5" /></button>
          <button className="w-8 h-7 grid place-items-center rounded hover:bg-white/10 hover:text-white"><Redo2 className="w-3.5 h-3.5" /></button>
        </div>

        {/* Actions */}
        <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] text-white/80 hover:bg-white/10">
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button className="flex items-center gap-1.5 h-8 px-3.5 rounded-md text-[12px] font-semibold text-black bg-gradient-to-r from-emerald-300 to-emerald-500 hover:from-emerald-200 hover:to-emerald-400 shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset]">
          <Rocket className="w-3.5 h-3.5" /> Publish
        </button>
      </header>

      {/* ── Body: rail · canvas · inspector ─────────────────────── */}
      <div className="flex">
        {/* Left rail */}
        <aside className="hidden md:flex sticky top-12 h-[calc(100vh-3rem)] w-14 flex-col items-center py-3 gap-1 border-e border-white/10 bg-[#0f0f16] z-30">
          {rail.map(({ icon: Icon, label }, i) => (
            <button
              key={i}
              className="group relative w-10 h-10 grid place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              aria-label={label}
            >
              <Icon className="w-4 h-4" />
              <span className="pointer-events-none absolute start-full ms-2 whitespace-nowrap rounded bg-black/90 px-2 py-1 text-[11px] opacity-0 group-hover:opacity-100 transition z-50">{label}</span>
            </button>
          ))}
          <div className="flex-1" />
          <button className="w-10 h-10 grid place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <Settings2 className="w-4 h-4" />
          </button>
        </aside>

        {/* Canvas */}
        <main className="flex-1 min-w-0 p-3 md:p-5">
          <div className={`mx-auto ${canvasMax} transition-[max-width] duration-500`}>
            {/* Canvas frame */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] bg-background" dir={isAr ? 'rtl' : 'ltr'}>
              {/* Canvas ruler top */}
              <div className="h-6 bg-[#0f0f16] border-b border-white/10 flex items-center px-3 gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-rose-400/70" />
                <span className="w-2 h-2 rounded-full bg-amber-400/70" />
                <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
                <span className="ms-2">{device} · 100%</span>
              </div>
              {children}
            </div>
          </div>
        </main>

        {/* Right inspector */}
        <aside className={`hidden lg:flex sticky top-12 h-[calc(100vh-3rem)] flex-col border-s border-white/10 bg-[#0f0f16] transition-[width] duration-300 ${inspectorOpen ? 'w-72' : 'w-10'}`}>
          <button
            onClick={() => setInspectorOpen((v) => !v)}
            className="h-9 flex items-center gap-2 px-3 text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {inspectorOpen && <span>Inspector</span>}
          </button>
          {inspectorOpen && (
            <div className="p-4 space-y-5 overflow-y-auto">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Selection</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Page</span>
                    <span className="text-emerald-300">{pageName || 'Home'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-white/70">Sections</span>
                    <span className="text-white/90">24</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Theme</div>
                <div className="grid grid-cols-4 gap-2">
                  {['#064E3B', '#0D7A5F', '#C9A84C', '#F5F0E0'].map((c) => (
                    <div key={c} className="aspect-square rounded-md ring-1 ring-white/10" style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Typography</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-[12px] space-y-1.5">
                  <div className="flex justify-between"><span className="text-white/60">Display</span><span>Syne</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Body</span><span>Plus Jakarta</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Arabic</span><span>Reem Kufi</span></div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Breakpoints</div>
                <div className="space-y-1.5 text-[12px]">
                  {[['Desktop', '≥1200'], ['Tablet', '750–1199'], ['Mobile', '<750']].map(([k, v]) => (
                    <div key={k} className="flex justify-between rounded bg-white/5 border border-white/10 px-2.5 py-1.5">
                      <span className="text-white/70">{k}</span><span className="text-white/50">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-white/40">
                Wix Studio-style shell · non-editable preview
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
