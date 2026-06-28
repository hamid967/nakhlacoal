import { useEffect, useState } from "react";
import logo from "@/assets/palm-charcoal-logo.png";

const CLIENTS_AR = [
  "فنادق ريتز كارلتون",
  "مطاعم نسما",
  "أسواق الدانوب",
  "مجموعة هرفي",
  "فنادق روتانا",
  "مطاعم البيك",
];

const CLIENTS_EN = [
  "Ritz-Carlton Hotels",
  "Nesma Restaurants",
  "Danube Markets",
  "Herfy Group",
  "Rotana Hotels",
  "Albaik",
];

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  // 0 = curtain, 1 = logo reveal, 2 = clients reveal, 3 = fade out

  useEffect(() => {
    const isAr =
      typeof document !== "undefined" && document.documentElement.dir === "rtl";
    void isAr;
    const t1 = setTimeout(() => setStage(1), 250);   // logo in
    const t2 = setTimeout(() => setStage(2), 1700);  // clients in
    const t3 = setTimeout(() => setStage(3), 3600);  // fade
    const t4 = setTimeout(() => setHidden(true), 4400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  if (hidden) return null;

  const isAr =
    typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const clients = isAr ? CLIENTS_AR : CLIENTS_EN;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] overflow-hidden bg-background transition-opacity duration-[800ms] ease-out ${
        stage === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* cinematic gold vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--gold) / 0.18) 0%, transparent 55%), radial-gradient(circle at 50% 110%, hsl(var(--gold) / 0.12), transparent 60%)",
        }}
      />

      {/* slow drifting ember particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute block w-1 h-1 rounded-full bg-[hsl(var(--gold))]/60 blur-[1px]"
            style={{
              left: `${(i * 73) % 100}%`,
              bottom: `-10%`,
              animation: `splash-ember ${8 + (i % 5)}s linear ${i * 0.4}s infinite`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* cinematic letterbox bars */}
      <div
        className={`absolute inset-x-0 top-0 h-[12vh] bg-background z-10 transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
          stage >= 1 ? "-translate-y-full" : "translate-y-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-[12vh] bg-background z-10 transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
          stage >= 1 ? "translate-y-full" : "translate-y-0"
        }`}
      />

      {/* center stage */}
      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div
          className={`relative transition-all duration-[1400ms] ease-out ${
            stage >= 1
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 scale-[1.12] blur-md"
          } ${stage >= 2 ? "-translate-y-6" : "translate-y-0"}`}
        >
          {/* halo */}
          <div
            className="absolute inset-0 -m-16 rounded-full opacity-70 animate-[splash-pulse_3.2s_ease-in-out_infinite]"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--gold) / 0.35), transparent 65%)",
            }}
          />
          <img
            src={logo}
            alt="Palm Charcoal"
            className="relative w-44 md:w-64 h-auto drop-shadow-[0_0_40px_hsl(var(--gold)/0.45)]"
          />
          {/* shimmer sweep */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ mixBlendMode: "overlay" }}
          >
            <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-[splash-sweep_2.4s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* loading bar */}
        <div
          className={`mt-8 h-[2px] w-48 overflow-hidden rounded-full bg-white/10 transition-opacity duration-700 ${
            stage >= 1 && stage < 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-full w-1/3 animate-[splash-slide_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent" />
        </div>

        {/* Clients reveal */}
        <div
          className={`absolute bottom-[14vh] left-0 right-0 flex flex-col items-center transition-all duration-[1000ms] ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-[hsl(var(--gold))]/80 mb-4">
            {isAr ? "يثق بنا" : "Trusted by"}
          </div>
          <div className="relative w-[min(92vw,820px)] overflow-hidden mask-fade">
            <div className="flex gap-10 md:gap-16 whitespace-nowrap animate-[splash-marquee_18s_linear_infinite]">
              {[...clients, ...clients].map((c, i) => (
                <span
                  key={i}
                  className={`text-sm md:text-base text-foreground/70 ${
                    isAr ? "font-arabic" : ""
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes splash-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes splash-sweep {
          0% { transform: translateX(0) skewX(12deg); }
          60%, 100% { transform: translateX(400%) skewX(12deg); }
        }
        @keyframes splash-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes splash-ember {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-115vh) translateX(20px); opacity: 0; }
        }
        .mask-fade {
          -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
                  mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
        }
      `}</style>
    </div>
  );
}
