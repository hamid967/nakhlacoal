import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { useParallax } from "@/hooks/useParallax";

const STEPS_AR = ["المنتج", "الكمية", "العنوان", "التأكيد"];
const STEPS_EN = ["Product", "Quantity", "Address", "Confirm"];

export default function NewOrder() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const steps = isAr ? STEPS_AR : STEPS_EN;
  const [step, setStep] = useState(0);
  useParallax();

  const progress = (step / (steps.length - 1)) * 100;

  return (
    <>
      <SeoHead title={isAr ? "طلب جديد" : "New Order"} noindex />
      <div className="container max-w-3xl py-24">
        <header className="mb-10 text-center">
          <span className="text-xs tracking-[0.3em] text-gold">11 · ORDER FLOW</span>
          <h1 className="font-serif text-4xl mt-2">{isAr ? "طلب جديد" : "New Order"}</h1>
        </header>

        {/* Stepper timeline */}
        <div className="relative mb-12">
          <div
            className="lux-timeline-line absolute top-3 start-0 end-0 h-[2px] rounded-full"
            style={{ ["--progress" as any]: `${progress}%` }}
          />
          <ol className="relative flex justify-between">
            {steps.map((label, i) => {
              const active = i <= step;
              return (
                <li key={label} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className={`lux-timeline-dot w-6 h-6 rounded-full border-2 ${
                      active ? "bg-primary border-primary" : "bg-background border-border"
                    }`}
                    data-active={i === step}
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

        <div className="glass-luxe lux-glass-hover rounded-lg p-8 min-h-[260px] flex items-center justify-center">
          <p className="text-muted-foreground">
            {isAr ? "الخطوة" : "Step"} {step + 1} — {steps[step]}
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            {isAr ? "السابق" : "Back"}
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>{isAr ? "التالي" : "Next"}</Button>
          ) : (
            <Button asChild>
              <Link to="/orders/demo">{isAr ? "تأكيد الطلب" : "Confirm Order"}</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
