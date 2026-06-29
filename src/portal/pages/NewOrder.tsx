import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INVENTORY } from "@/data/inventory";
import { useParallax } from "@/hooks/useParallax";

const SHIPPING = [
  { id: "pickup", ar: "استلام من المستودع", en: "Warehouse pickup", days: 0 },
  { id: "standard", ar: "شحن قياسي (2-4 أيام)", en: "Standard (2-4 days)", days: 3 },
  { id: "express", ar: "شحن سريع (24 ساعة)", en: "Express (24h)", days: 1 },
  { id: "freight", ar: "شحن بضاعة (للجملة)", en: "Freight (wholesale)", days: 5 },
];

const PAYMENT = [
  { id: "bank_transfer", ar: "تحويل بنكي", en: "Bank transfer" },
  { id: "cod", ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  { id: "invoice", ar: "فاتورة آجلة (B2B)", en: "Net-30 invoice (B2B)" },
];

const schema = z.object({
  product_type: z.string().min(1),
  quantity: z.number().min(1).max(100000),
  company_name: z.string().trim().min(1).max(200),
  contact_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  address: z.string().trim().min(3).max(500),
  city: z.string().trim().min(1).max(100),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().min(1).max(100),
  shipping_method: z.string().min(1),
  payment_method: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type Form = z.infer<typeof schema>;

export default function PortalNewOrder() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAr = i18n.language?.startsWith("ar");
  useParallax();

  const STEPS = isAr
    ? ["المنتج", "الكمية", "العنوان", "الشحن والدفع", "تأكيد"]
    : ["Product", "Quantity", "Address", "Shipping & Payment", "Confirm"];

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({
    product_type: "",
    quantity: 50,
    company_name: "",
    contact_name: "",
    phone: "",
    email: user?.email ?? "",
    address: "",
    city: "",
    postal_code: "",
    country: isAr ? "السعودية" : "Saudi Arabia",
    shipping_method: "",
    payment_method: "",
    notes: "",
  });

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const selectedItem = useMemo(
    () => INVENTORY.find((i) => i.label === form.product_type) ?? null,
    [form.product_type]
  );

  const pricePerKg = useMemo(() => {
    if (!selectedItem) return 0;
    const tier = [...selectedItem.tiers].reverse().find((t) => form.quantity >= t.minKg);
    return tier?.pricePerKg ?? selectedItem.tiers[0].pricePerKg;
  }, [selectedItem, form.quantity]);

  const total = pricePerKg * form.quantity;

  const canNext = (): boolean => {
    if (step === 0) return !!form.product_type;
    if (step === 1) return form.quantity >= (selectedItem?.minOrderKg ?? 1);
    if (step === 2)
      return [form.company_name, form.contact_name, form.phone, form.address, form.city, form.country].every(
        (v) => v.trim().length > 0
      );
    if (step === 3) return !!form.shipping_method && !!form.payment_method;
    return true;
  };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(isAr ? "تحقق من الحقول" : "Please check the fields");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        product_type: parsed.data.product_type,
        quantity: parsed.data.quantity,
        unit: "kg",
        company_name: parsed.data.company_name,
        contact_name: parsed.data.contact_name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        address: parsed.data.address,
        city: parsed.data.city,
        postal_code: parsed.data.postal_code || null,
        country: parsed.data.country,
        shipping_method: parsed.data.shipping_method,
        payment_method: parsed.data.payment_method,
        notes: parsed.data.notes || null,
        status: "pending",
        ai_summary: `${parsed.data.quantity}kg ${parsed.data.product_type} · ${pricePerKg} SAR/kg · Total ${total} SAR`,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isAr ? "تم إنشاء الطلب" : "Order created");
    navigate(`/portal/orders/${data.id}`);
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <>
      <SeoHead title={isAr ? "طلب جديد" : "New Order"} noindex />
      <div className="relative overflow-hidden">
        <div aria-hidden className="lux-parallax lux-parallax-slow pointer-events-none absolute -top-32 -start-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(closest-side, hsl(var(--gold-hi) / 0.35), transparent)" }} />
        <div aria-hidden className="lux-parallax lux-parallax-med pointer-events-none absolute top-40 -end-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(closest-side, hsl(var(--jade) / 0.30), transparent)" }} />

        <div className="container max-w-3xl py-12 relative">
          <header className="mb-8 text-center">
            <span className="text-xs tracking-[0.3em] text-gold">PORTAL · ORDER WIZARD</span>
            <h1 className="font-serif text-3xl mt-2">{isAr ? "إنشاء طلب جديد" : "Create a new order"}</h1>
          </header>

          <div className="relative mb-10">
            <div className="lux-timeline-line absolute top-3 start-0 end-0 h-[2px] rounded-full"
              style={{ ["--progress" as any]: `${progress}%` }} />
            <ol className="relative flex justify-between">
              {STEPS.map((label, i) => (
                <li key={label} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    className={`lux-timeline-dot w-6 h-6 rounded-full border-2 ${
                      i <= step ? "bg-primary border-primary" : "bg-background border-border"
                    }`}
                    aria-label={label}
                  />
                  <span className={`text-xs ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-luxe lux-glass-hover rounded-lg p-6 md:p-8 min-h-[320px]">
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {INVENTORY.map((item) => {
                  const active = form.product_type === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => update("product_type", item.label)}
                      className={`text-start p-4 rounded-lg border-2 transition ${
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {isAr ? "متوفر" : "In stock"}: {item.inStockKg.toLocaleString()} kg ·{" "}
                        {isAr ? "أقل طلب" : "Min"} {item.minOrderKg} kg
                      </div>
                      <div className="text-xs text-gold mt-1">
                        {isAr ? "من" : "From"} {item.tiers[item.tiers.length - 1].pricePerKg} SAR/kg
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && selectedItem && (
              <div className="space-y-4">
                <Label>{isAr ? "الكمية (كجم)" : "Quantity (kg)"}</Label>
                <Input
                  type="number"
                  min={selectedItem.minOrderKg}
                  max={selectedItem.inStockKg}
                  value={form.quantity}
                  onChange={(e) => update("quantity", Number(e.target.value))}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedItem.tiers.map((t) => (
                    <button
                      key={t.minKg}
                      type="button"
                      onClick={() => update("quantity", Math.max(t.minKg, selectedItem.minOrderKg))}
                      className={`p-3 rounded border text-sm ${
                        form.quantity >= t.minKg && pricePerKg === t.pricePerKg
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      ≥ {t.minKg} kg → {t.pricePerKg} SAR/kg
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded bg-muted/40 flex justify-between">
                  <span>{isAr ? "الإجمالي التقديري" : "Estimated total"}</span>
                  <strong className="text-gold">{total.toLocaleString()} SAR</strong>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>{isAr ? "اسم الشركة" : "Company"}</Label>
                  <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} /></div>
                <div><Label>{isAr ? "اسم المسؤول" : "Contact"}</Label>
                  <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} /></div>
                <div><Label>{isAr ? "الجوال" : "Phone"}</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
                <div><Label>{isAr ? "البريد" : "Email"}</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>{isAr ? "العنوان" : "Address"}</Label>
                  <Input value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
                <div><Label>{isAr ? "المدينة" : "City"}</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
                <div><Label>{isAr ? "الرمز البريدي" : "Postal code"}</Label>
                  <Input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>{isAr ? "البلد" : "Country"}</Label>
                  <Input value={form.country} onChange={(e) => update("country", e.target.value)} /></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">{isAr ? "طريقة الشحن" : "Shipping method"}</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SHIPPING.map((s) => (
                      <button key={s.id} type="button" onClick={() => update("shipping_method", s.id)}
                        className={`text-start p-3 rounded border-2 ${
                          form.shipping_method === s.id ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                        <div className="font-medium text-sm">{isAr ? s.ar : s.en}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">{isAr ? "طريقة الدفع" : "Payment method"}</Label>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {PAYMENT.map((p) => (
                      <button key={p.id} type="button" onClick={() => update("payment_method", p.id)}
                        className={`p-3 rounded border-2 text-sm ${
                          form.payment_method === p.id ? "border-primary bg-primary/5" : "border-border"
                        }`}>{isAr ? p.ar : p.en}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>{isAr ? "ملاحظات" : "Notes"}</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 text-sm">
                <h3 className="font-serif text-xl mb-2">{isAr ? "ملخص الطلب" : "Order summary"}</h3>
                <Row k={isAr ? "المنتج" : "Product"} v={form.product_type} />
                <Row k={isAr ? "الكمية" : "Quantity"} v={`${form.quantity} kg`} />
                <Row k={isAr ? "السعر" : "Price"} v={`${pricePerKg} SAR/kg`} />
                <Row k={isAr ? "الإجمالي" : "Total"} v={`${total.toLocaleString()} SAR`} highlight />
                <Row k={isAr ? "الشركة" : "Company"} v={form.company_name} />
                <Row k={isAr ? "العنوان" : "Address"} v={`${form.address}, ${form.city}, ${form.country}`} />
                <Row k={isAr ? "الشحن" : "Shipping"} v={form.shipping_method} />
                <Row k={isAr ? "الدفع" : "Payment"} v={form.payment_method} />
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" disabled={step === 0 || saving} onClick={() => setStep((s) => s - 1)}>
              {isAr ? "السابق" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                {isAr ? "التالي" : "Next"}
              </Button>
            ) : (
              <Button disabled={saving} onClick={submit}>
                {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "تأكيد وإرسال" : "Confirm & submit"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/50">
      <span className="text-muted-foreground">{k}</span>
      <span className={highlight ? "text-gold font-semibold" : ""}>{v}</span>
    </div>
  );
}
