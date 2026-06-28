import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/palm-charcoal-logo.png";
import heroCharcoal from "@/assets/hero-charcoal.jpg";
import productBbq from "@/assets/product-bbq.jpg";
import productCoconut from "@/assets/product-coconut.jpg";
import productHookah from "@/assets/product-hookah.jpg";
import productLump from "@/assets/product-lump.jpg";
import productBox from "@/assets/product-box.jpg";
import jeddahStamp from "@/assets/jeddah-stamp.png";
import { trademarks } from "@/data/trademarks";

const PRELOAD = [logo, heroCharcoal, jeddahStamp, productBbq, productCoconut, productHookah, productLump, productBox, ...trademarks.map(t => t.image)];

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
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStage(1), 200));     // logo in
    timers.push(window.setTimeout(() => setStage(2), 1400));    // start brand parade

    // brand parade: ~750ms per brand
    trademarks.forEach((_, i) => {
      timers.push(window.setTimeout(() => setBrandIdx(i), 1400 + i * 750));
    });

    const paradeEnd = 1400 + trademarks.length * 750; // ~5150
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
        background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.18) 0%, transparent 55%), radial-gradient(circle at 50% 110%, hsl(var(--gold) / 0.12), transparent 60%)",
      }} />

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
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
        </div>

        {/* Trademark parade */}
        <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-500 ${
          stage === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          <div key={current.id} className="flex flex-col items-center animate-[brand-reveal_0.5s_ease-out]">
            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-white/5 backdrop-blur-sm border border-[hsl(var(--gold))]/30 p-4 flex items-center justify-center"
              style={{ boxShadow: "0 0 60px hsl(var(--gold) / 0.25)" }}>
              <img src={current.image} alt={current.nameAr} className="max-w-full max-h-full object-contain"  />
            </div>
            <h3 className="mt-5 font-serif text-2xl md:text-3xl text-[hsl(var(--gold))]">{current.nameAr}</h3>
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
        .mask-fade { -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); }
      `}</style>
    </div>
  );
}
