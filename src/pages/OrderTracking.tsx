import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useParallax } from "@/hooks/useParallax";

const STAGES_AR = ["جديد", "قيد التجهيز", "تم الشحن", "تم التسليم"];
const STAGES_EN = ["New", "Preparing", "Shipped", "Delivered"];

export default function OrderTracking() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const stages = isAr ? STAGES_AR : STAGES_EN;
  useParallax();

  // Demo: simulate current stage; replace with Supabase fetch when wired
  const [current, setCurrent] = useState(2);
  const progress = useMemo(() => (current / (stages.length - 1)) * 100, [current, stages.length]);

  return (
    <>
      <SeoHead title={isAr ? "تتبع الطلب" : "Track Order"} description={isAr ? "تتبّع حالة طلبك من فحم النخلة لحظة بلحظة حتى الاستلام." : "Track your Palm Charcoal order status in real time until delivery."} noindex />
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="lux-parallax lux-parallax-slow pointer-events-none absolute -top-24 -start-20 w-[380px] h-[380px] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(closest-side, hsl(var(--gold-hi) / 0.30), transparent)" }}
        />
        <div
          aria-hidden
          className="lux-parallax lux-parallax-med pointer-events-none absolute top-40 -end-20 w-[320px] h-[320px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(closest-side, hsl(var(--jade) / 0.28), transparent)" }}
        />
        <div
          aria-hidden
          className="lux-parallax lux-parallax-fast pointer-events-none absolute bottom-10 start-1/3 w-[280px] h-[280px] rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(closest-side, hsl(var(--gold) / 0.25), transparent)" }}
        />

        <div className="container max-w-4xl py-24 relative">
          <header className="mb-10">
            <span className="text-xs tracking-[0.3em] text-gold">12 · ORDER TRACKING</span>
            <h1 className="font-serif text-4xl mt-2">{isAr ? "تتبع الطلب" : "Order Tracking"}</h1>
            <p className="text-muted-foreground mt-1">#{id ?? "PC-2025-3487"}</p>
          </header>

          {/* Horizontal timeline */}
          <div className="relative mb-16">
            <div
              className="lux-timeline-line absolute top-3 start-0 end-0 h-[2px] rounded-full"
              style={{ ["--progress" as any]: `${progress}%` }}
            />
            <ol className="relative flex justify-between">
              {stages.map((label, i) => {
                const active = i <= current;
                return (
                  <li key={label} className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrent(i)}
                      className={`lux-timeline-dot w-6 h-6 rounded-full border-2 ${
                        active ? "bg-primary border-primary" : "bg-background border-border"
                      }`}
                      data-active={i === current}
                      aria-label={label}
                    />
                    <span className={`text-sm ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-luxe lux-glass-hover lux-rise rounded-lg p-6">
              <h2 className="font-serif text-xl mb-3">{isAr ? "ملخص الطلب" : "Order Summary"}</h2>
              <p className="text-muted-foreground text-sm">
                {isAr ? "فحم النخلة الفاخر — 10 صناديق" : "Premium Palm Charcoal — 10 boxes"}
              </p>
              <p className="mt-3 font-semibold text-primary">SAR 145.00</p>
            </div>
            <div className="glass-luxe lux-glass-hover lux-rise lux-rise-1 rounded-lg p-6">
              <h2 className="font-serif text-xl mb-3">{isAr ? "الشحن" : "Shipping"}</h2>
              <p className="text-muted-foreground text-sm">SMSA Express · 1234567890123</p>
              <p className="mt-3 text-sm">
                {isAr ? "التسليم المتوقع: 28 مايو" : "Estimated delivery: May 28"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
