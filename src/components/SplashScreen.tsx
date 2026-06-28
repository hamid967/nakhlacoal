import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/palm-charcoal-logo.png";
import heroCharcoal from "@/assets/hero-charcoal.jpg";
import productBbq from "@/assets/product-bbq.jpg";
import productCoconut from "@/assets/product-coconut.jpg";
import productHookah from "@/assets/product-hookah.jpg";
import productLump from "@/assets/product-lump.jpg";
import productBox from "@/assets/product-box.jpg";
import { trademarks } from "@/data/trademarks";

const PRELOAD = [logo, heroCharcoal, productBbq, productCoconut, productHookah, productLump, productBox, ...trademarks.map(t => t.image)];

const CLIENTS_AR = ["فنادق ريتز كارلتون","مطاعم نسما","أسواق الدانوب","مجموعة هرفي","فنادق روتانا","مطاعم البيك"];
const CLIENTS_EN = ["Ritz-Carlton Hotels","Nesma Restaurants","Danube Markets","Herfy Group","Rotana Hotels","Albaik"];

const SESSION_KEY = "palm-charcoal-intro-shown";

const preloadImages = (srcs: string[]) =>
  Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );

export function SplashScreen() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });
  const [ready, setReady] = useState(false);
  // 0 init, 1 logo, 2 trademark parade, 3 final logo + clients, 4 fade
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [brandIdx, setBrandIdx] = useState(0);

  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    const safety = setTimeout(() => !cancelled && setReady(true), 6000);
    preloadImages(PRELOAD).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; clearTimeout(safety); };
  }, [hidden]);

  useEffect(() => {
    if (!ready) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];

    if (reduce) {
      // Honor reduced motion: skip parade, show final stage briefly, then exit.
      setStage(3);
      timers.push(window.setTimeout(() => setStage(4), 600));
      timers.push(window.setTimeout(() => {
        setHidden(true);
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
        navigate("/");
      }, 1100));
      return () => timers.forEach(clearTimeout);
    }

    timers.push(window.setTimeout(() => setStage(1), 200));
    timers.push(window.setTimeout(() => setStage(2), 1400));
    trademarks.forEach((_, i) => {
      timers.push(window.setTimeout(() => setBrandIdx(i), 1400 + i * 750));
    });
    const paradeEnd = 1400 + trademarks.length * 750;
    timers.push(window.setTimeout(() => setStage(3), paradeEnd));
    timers.push(window.setTimeout(() => setStage(4), paradeEnd + 1200));
    timers.push(window.setTimeout(() => {
      setHidden(true);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      navigate("/");
    }, paradeEnd + 2000));
    return () => timers.forEach(clearTimeout);
  }, [ready]);

  if (hidden) return null;

  const isAr = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const clients = isAr ? CLIENTS_AR : CLIENTS_EN;

  const handleSkip = () => {
    setStage(4);
    setTimeout(() => {
      setHidden(true);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      navigate("/");
    }, 600);
  };

  const current = trademarks[Math.min(brandIdx, trademarks.length - 1)];

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-background transition-opacity duration-[800ms] ease-out ${
        stage === 4 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-5 end-5 z-30 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-foreground/70 hover:text-[hsl(var(--gold))] border border-foreground/20 hover:border-[hsl(var(--gold))]/60 rounded-full backdrop-blur-sm bg-background/30 transition-colors"
      >
        {isAr ? "تخطي" : "Skip"}
      </button>

      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.22) 0%, transparent 55%), radial-gradient(circle at 50% 110%, hsl(var(--gold) / 0.14), transparent 60%), radial-gradient(circle at 50% -10%, hsl(150 60% 8% / 0.55), transparent 55%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)",
      }} />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 35%, hsl(0 0% 0% / 0.55) 100%)",
      }} />

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay" aria-hidden style={{
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.85'/></svg>\")",
      }} />

      {/* Slow rotating gilded ring behind logo */}
      <div className={`absolute top-1/2 left-1/2 pointer-events-none transition-opacity duration-[1400ms] ${stage >= 1 && stage < 4 ? "opacity-60" : "opacity-0"}`}
        style={{ width: "min(72vmin, 640px)", height: "min(72vmin, 640px)", transform: "translate(-50%, -50%)", animation: stage >= 1 ? "splash-rotate 60s linear infinite" : undefined }} aria-hidden>
        <div className="w-full h-full rounded-full border border-[hsl(var(--gold))]/20"
          style={{ boxShadow: "inset 0 0 80px hsl(var(--gold) / 0.08), 0 0 60px hsl(var(--gold) / 0.06)" }} />
        <div className="absolute inset-[8%] rounded-full border border-dashed border-[hsl(var(--gold))]/15" />
      </div>

      {/* Gold dust suspended particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {Array.from({ length: 28 }).map((_, i) => {
          const size = 1 + (i % 4) * 0.5;
          return (
            <span key={`dust-${i}`} className="absolute rounded-full bg-[hsl(var(--gold))]"
              style={{
                width: `${size}px`, height: `${size}px`,
                top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`,
                opacity: 0.25 + (i % 5) * 0.1,
                boxShadow: "0 0 6px hsl(var(--gold) / 0.7)",
                animation: `splash-drift ${14 + (i % 7)}s ease-in-out ${i * 0.3}s infinite alternate`,
              }} />
          );
        })}
      </div>


      {/* Trademark constellation background — clamped to corners, never overlaps logo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {trademarks.map((t, i) => {
          const positions = [
            { top: "6%",    left: "4%",  size: "clamp(56px, 10vmin, 110px)", rot: -8,  delay: "0s"   },
            { top: "8%",    right: "4%", size: "clamp(64px, 12vmin, 130px)", rot:  6,  delay: "0.4s" },
            { bottom: "14%",left: "3%",  size: "clamp(60px, 11vmin, 120px)", rot:  5,  delay: "0.8s" },
            { bottom: "10%",right: "4%", size: "clamp(70px, 13vmin, 140px)", rot: -7,  delay: "1.2s" },
            { top: "50%",   left: "1.5%",size: "clamp(48px,  9vmin,  90px)", rot: 10,  delay: "1.6s" },
          ];
          const p: any = positions[i % positions.length];
          return (
            <img
              key={t.id}
              src={t.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute opacity-[0.05] md:opacity-[0.07] motion-safe:animate-[splash-float_11s_ease-in-out_infinite] will-change-transform"
              style={{ top: p.top, right: p.right, bottom: p.bottom, left: p.left, width: p.size, height: p.size, transform: `rotate(${p.rot}deg)`, animationDelay: p.delay, filter: "sepia(1) hue-rotate(8deg) saturate(2.2) brightness(1.05)" }}
            />
          );
        })}
      </div>

      {/* Luxury conic halo behind logo */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-[1800ms] ease-in-out ${stage >= 1 && stage < 4 ? "opacity-70" : "opacity-0"}`}
        style={{ width: "min(64vmin, 560px)", height: "min(64vmin, 560px)" }} aria-hidden>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: "conic-gradient(from 0deg, hsl(var(--gold) / 0.0) 0deg, hsl(var(--gold) / 0.32) 70deg, hsl(var(--gold) / 0.0) 140deg, hsl(var(--gold) / 0.26) 220deg, hsl(var(--gold) / 0.0) 290deg, hsl(var(--gold) / 0.32) 360deg)",
          filter: "blur(34px)",
          willChange: "transform",
          animation: stage >= 1 ? "splash-halo 48s linear infinite, splash-halo-breathe 7s ease-in-out infinite" : undefined,
        }} />
      </div>

      {/* Caustic sweep — silk-like light passing across the screen */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-[1200ms] ease-in-out ${stage >= 1 && stage < 4 ? "opacity-100" : "opacity-0"}`} aria-hidden style={{ overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, transparent 38%, hsl(var(--gold) / 0.10) 48%, hsl(var(--gold) / 0.18) 50%, hsl(var(--gold) / 0.10) 52%, transparent 62%)",
          mixBlendMode: "screen",
          width: "220%",
          left: "-60%",
          willChange: "transform",
          animation: stage >= 1 ? "splash-caustic 14s cubic-bezier(0.65,0,0.35,1) infinite" : undefined,
        }} />
      </div>

      {/* Ornate frame corners */}
      <div className={`absolute inset-6 md:inset-10 pointer-events-none transition-opacity duration-1000 ${stage >= 1 && stage < 4 ? "opacity-60" : "opacity-0"}`}>
        {["top-0 left-0","top-0 right-0 rotate-90","bottom-0 right-0 rotate-180","bottom-0 left-0 -rotate-90"].map((c,i)=>(
          <span key={i} className={`absolute ${c} w-14 h-14 border-t border-l border-[hsl(var(--gold))]/50`} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="absolute block w-1 h-1 rounded-full bg-[hsl(var(--gold))]/60 blur-[1px]"
            style={{ left: `${(i * 73) % 100}%`, bottom: `-10%`,
              animation: `splash-ember ${8 + (i % 5)}s linear ${i * 0.4}s infinite`, opacity: 0.5 }} />
        ))}
      </div>

      <div className={`absolute inset-x-0 top-0 h-[12vh] bg-background z-10 transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] ${stage >= 1 ? "-translate-y-full" : "translate-y-0"}`} />
      <div className={`absolute inset-x-0 bottom-0 h-[12vh] bg-background z-10 transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] ${stage >= 1 ? "translate-y-full" : "translate-y-0"}`} />

      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        {/* Gold scanning line */}
        <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent transition-opacity duration-700 ${
          stage >= 1 && stage < 4 ? "opacity-60" : "opacity-0"
        }`} style={{ animation: stage >= 1 ? "splash-scan 4s ease-in-out infinite" : undefined }} />

        {/* Arabic ornament above logo */}
        <div className={`absolute top-[18vh] flex items-center gap-3 transition-all duration-[1200ms] ${
          stage >= 1 && stage < 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}>
          <span className="h-px w-10 bg-[hsl(var(--gold))]/50" />
          <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-[hsl(var(--gold))]/80">
            {isAr ? "منذ ٢٠١٠ · صناعة سعودية" : "Since 2010 · Made in Saudi Arabia"}
          </span>
          <span className="h-px w-10 bg-[hsl(var(--gold))]/50" />
        </div>

        {/* Logo (shrinks/moves up during brand parade) */}
        <div className={`relative transition-all duration-[1000ms] ease-out ${
          stage >= 1 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[1.12] blur-md"
        } ${stage === 2 ? "scale-50 -translate-y-[18vh]" : ""} ${stage >= 3 ? "scale-100 translate-y-0" : ""}`}>
          <div className="absolute inset-0 -m-16 rounded-full opacity-70 animate-[splash-pulse_3.2s_ease-in-out_infinite]"
            style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.35), transparent 65%)" }} />
          <img src={logo} alt="Palm Charcoal" className="relative w-44 md:w-64 h-auto drop-shadow-[0_0_40px_hsl(var(--gold)/0.45)]"  />
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ mixBlendMode: "overlay" }}>
            <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-[splash-sweep_2.4s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Tagline under logo */}
        <div className={`mt-6 text-center transition-all duration-[1000ms] ${
          (stage === 1 || stage >= 3) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}>
          <h1 className={`font-serif text-2xl md:text-4xl text-foreground ${isAr ? "font-arabic" : ""}`}>
            {isAr ? "فحم النخلة" : "Palm Charcoal"}
          </h1>
          <p className="mt-2 text-[11px] md:text-sm tracking-[0.35em] uppercase text-[hsl(var(--gold))]/80">
            {isAr ? "جمر الفخامة" : "The Ember of Luxury"}
          </p>
          {/* Heritage badge — gilded seal */}
          <div className="mt-5 inline-flex items-center gap-3 px-5 py-1.5 rounded-full border border-[hsl(var(--gold))]/40 bg-gradient-to-r from-[hsl(var(--gold))]/[0.06] via-[hsl(var(--gold))]/[0.12] to-[hsl(var(--gold))]/[0.06] backdrop-blur-sm shadow-[0_0_24px_hsl(var(--gold)/0.18)]">
            <span className="text-[hsl(var(--gold))] text-base leading-none">✦</span>
            <span className={`text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-[hsl(var(--gold-hi))] ${isAr ? "font-arabic" : ""}`}>
              {isAr ? "من جدة · صناعة سعودية" : "From Jeddah · Made in Saudi Arabia"}
            </span>
            <span className="text-[hsl(var(--gold))] text-base leading-none">✦</span>
          </div>
        </div>

        {/* Trademark 3D coverflow — "علاماتنا" */}
        <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-500 ${
          stage === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          <div className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-[hsl(var(--gold))]/85 mb-6">
            {isAr ? "علاماتنا" : "Our Brands"}
          </div>

          <div
            className="relative w-full h-52 md:h-72 flex items-center justify-center"
            style={{ perspective: "1400px" }}
          >
            {trademarks.map((t, i) => {
              const offset = i - brandIdx;
              const abs = Math.abs(offset);
              if (abs > 3) return null;
              const isActive = offset === 0;
              const translateX = offset * 130;
              const rotateY = offset * -32;
              const scale = isActive ? 1 : 0.78 - Math.min(abs - 1, 2) * 0.08;
              const opacity = isActive ? 1 : Math.max(0.25, 0.7 - (abs - 1) * 0.2);
              return (
                <div
                  key={t.id}
                  className="absolute transition-all duration-700 ease-out"
                  style={{
                    transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex: 50 - abs,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="w-36 h-36 md:w-52 md:h-52 rounded-2xl bg-white/5 backdrop-blur-sm border border-[hsl(var(--gold))]/30 p-4 flex items-center justify-center"
                    style={{
                      boxShadow: isActive
                        ? "0 0 80px hsl(var(--gold) / 0.35), 0 20px 60px rgba(0,0,0,0.5)"
                        : "0 10px 40px rgba(0,0,0,0.4)",
                    }}
                  >
                    <img src={t.image} alt={t.nameAr} className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              );
            })}
          </div>

          <div key={current.id} className="flex flex-col items-center mt-6 animate-[brand-reveal_0.5s_ease-out]">
            <h3 className="font-serif text-2xl md:text-3xl text-[hsl(var(--gold))]">{current.nameAr}</h3>
            <p className="text-xs md:text-sm text-foreground/60 mt-1">{current.nameEn}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-foreground/40 mt-3">
              {isAr ? "علامة تجارية مسجلة — المملكة العربية السعودية" : "Registered Trademark — Saudi Arabia"}
            </p>
            <p className="text-[10px] text-[hsl(var(--gold))]/70 mt-1 tabular-nums font-mono">
              {isAr ? "رقم التسجيل" : "Reg. No"} · {current.registrationNo}
            </p>
            <div className="flex gap-1.5 mt-5">
              {trademarks.map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all duration-300 ${
                  i === brandIdx ? "w-6 bg-[hsl(var(--gold))]" : i < brandIdx ? "w-3 bg-[hsl(var(--gold))]/50" : "w-3 bg-foreground/20"
                }`} />
              ))}
            </div>
          </div>
        </div>

        {/* loading bar (hidden during parade) */}
        <div className={`mt-8 h-[2px] w-48 overflow-hidden rounded-full bg-white/10 transition-opacity duration-700 ${
          stage === 1 ? "opacity-100" : "opacity-0"
        }`}>
          <div className="h-full w-1/3 animate-[splash-slide_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent" />
        </div>

        {/* Clients reveal — final stage */}
        <div className={`absolute bottom-[10vh] left-0 right-0 flex flex-col items-center transition-all duration-[1000ms] ${
          stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <div className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-[hsl(var(--gold))]/80 mb-4">
            {isAr ? "يثق بنا" : "Trusted by"}
          </div>
          <div className="relative w-[min(92vw,820px)] overflow-hidden mask-fade">
            <div className="flex gap-10 md:gap-16 whitespace-nowrap animate-[splash-marquee_18s_linear_infinite]">
              {[...clients, ...clients].map((c, i) => (
                <span key={i} className={`text-sm md:text-base text-foreground/70 ${isAr ? "font-arabic" : ""}`}>{c}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="mt-6 px-6 py-2.5 text-[11px] uppercase tracking-[0.35em] text-background bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_hsl(var(--gold)/0.5)]"
          >
            {isAr ? "ادخل التجربة" : "Enter Experience"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes splash-pulse { 0%,100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.06); opacity: 1; } }
        @keyframes splash-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        @keyframes splash-sweep { 0% { transform: translateX(0) skewX(12deg); } 60%,100% { transform: translateX(400%) skewX(12deg); } }
        @keyframes splash-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes splash-ember { 0% { transform: translateY(0) translateX(0); opacity: 0; } 15% { opacity: 0.8; } 100% { transform: translateY(-115vh) translateX(20px); opacity: 0; } }
        @keyframes brand-reveal { 0% { opacity: 0; transform: translateY(20px) scale(0.92); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes splash-scan { 0%,100% { transform: translateY(0); } 50% { transform: translateY(100vh); } }
        @keyframes splash-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-12px) rotate(var(--r,0deg)); } }
        @keyframes splash-rotate { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes splash-drift { 0% { transform: translate(0, 0); } 50% { transform: translate(18px, -22px); } 100% { transform: translate(-14px, 14px); } }
        @keyframes splash-caustic { 0%,100% { background-position: -40% 0; opacity: 0.0; } 50% { background-position: 140% 0; opacity: 1; } }
        .mask-fade { -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); }
        @media (prefers-reduced-motion: reduce) {
          .fixed[class*="z-[100]"] *,
          .fixed[class*="z-[100]"] *::before,
          .fixed[class*="z-[100]"] *::after {
            animation: none !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}
