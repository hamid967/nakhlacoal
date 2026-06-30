import { useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Download } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  onDownload?: () => void;
  isAr?: boolean;
};

/**
 * Zoomable / pannable image viewer.
 * - Buttons: zoom in/out, reset, fullscreen, optional download
 * - Wheel + pinch zoom, drag to pan when zoomed
 * - Works on touch (single-finger pan, two-finger pinch)
 */
export function ZoomableImage({ src, alt = "", onDownload, isAr }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [fs, setFs] = useState(false);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());

  const clampScale = (s: number) => Math.min(5, Math.max(1, s));
  const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };
  const zoomIn = () => setScale((s) => clampScale(s + 0.5));
  const zoomOut = () => {
    setScale((s) => {
      const n = clampScale(s - 0.5);
      if (n === 1) setPos({ x: 0, y: 0 });
      return n;
    });
  };

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => clampScale(s + (e.deltaY > 0 ? -0.25 : 0.25)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(b.x - a.x, b.y - a.y), scale };
      drag.current = null;
    } else if (scale > 1) {
      drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      setScale(clampScale(pinch.current.scale * (d / pinch.current.dist)));
    } else if (drag.current) {
      setPos({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  return (
    <figure
      ref={wrapRef}
      className={`relative group border-luxe rounded-md overflow-hidden bg-background/40 ${fs ? "fixed inset-0 z-[80] rounded-none" : ""}`}
    >
      <div
        className="relative w-full h-full overflow-hidden touch-none select-none"
        style={{ aspectRatio: fs ? undefined : "16 / 10", height: fs ? "100vh" : undefined, cursor: scale > 1 ? "grab" : "zoom-in" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => (scale === 1 ? setScale(2) : reset())}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain will-change-transform"
          style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`, transition: drag.current || pinch.current ? "none" : "transform 0.18s ease-out" }}
        />
      </div>

      <div className="absolute top-3 end-3 flex items-center gap-1 rounded-lg bg-background/70 backdrop-blur border-luxe p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <IconBtn label={isAr ? "تصغير" : "Zoom out"} onClick={zoomOut} disabled={scale <= 1}><ZoomOut className="w-3.5 h-3.5" /></IconBtn>
        <span className="px-1.5 text-[10px] tabular-nums text-foreground/70 w-9 text-center">{Math.round(scale * 100)}%</span>
        <IconBtn label={isAr ? "تكبير" : "Zoom in"} onClick={zoomIn} disabled={scale >= 5}><ZoomIn className="w-3.5 h-3.5" /></IconBtn>
        <IconBtn label={isAr ? "إعادة" : "Reset"} onClick={reset} disabled={scale === 1 && pos.x === 0 && pos.y === 0}><RotateCcw className="w-3.5 h-3.5" /></IconBtn>
        <IconBtn label={fs ? (isAr ? "إنهاء" : "Exit") : (isAr ? "ملء" : "Full")} onClick={() => setFs((v) => !v)}>
          {fs ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </IconBtn>
        {onDownload && (
          <IconBtn label="PNG" onClick={onDownload}><Download className="w-3.5 h-3.5" /></IconBtn>
        )}
      </div>
    </figure>
  );
}

function IconBtn({ children, label, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="p-1.5 rounded-md text-foreground/80 hover:text-gold-hi hover:bg-gold/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      {...rest}
    >
      {children}
    </button>
  );
}
