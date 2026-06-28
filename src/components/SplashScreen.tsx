import { useEffect, useState } from "react";
import logo from "@/assets/palm-charcoal-logo.png";

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1400);
    const t2 = setTimeout(() => setHidden(true), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* radial gold glow */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--gold) / 0.18), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-6">
        <img
          src={logo}
          alt="Palm Charcoal"
          className="w-40 md:w-56 h-auto animate-[splash-pulse_1.8s_ease-in-out_infinite] drop-shadow-[0_0_30px_hsl(var(--gold)/0.35)]"
        />
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[splash-slide_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes splash-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
