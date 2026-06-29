// Live pricing & stock catalog for the AI order assistant.
// Quantities in kilograms. Prices in SAR per kg, with tiered wholesale discounts.

export type InventoryItem = {
  match: RegExp;            // matches product_type strings produced by the AI
  label: string;
  inStockKg: number;        // current available stock
  minOrderKg: number;
  tiers: { minKg: number; pricePerKg: number }[]; // descending logic via threshold
  leadDays: number;
};

export const INVENTORY: InventoryItem[] = [
  {
    match: /شواء|bbq/i,
    label: 'فحم الشواء',
    inStockKg: 4200,
    minOrderKg: 5,
    leadDays: 1,
    tiers: [
      { minKg: 0,    pricePerKg: 18 },
      { minKg: 50,   pricePerKg: 15 },
      { minKg: 250,  pricePerKg: 12 },
      { minKg: 1000, pricePerKg: 10 },
    ],
  },
  {
    match: /جوز الهند|coconut|معسل/i,
    label: 'فحم جوز الهند / المعسل',
    inStockKg: 2800,
    minOrderKg: 5,
    leadDays: 1,
    tiers: [
      { minKg: 0,    pricePerKg: 32 },
      { minKg: 50,   pricePerKg: 28 },
      { minKg: 250,  pricePerKg: 24 },
      { minKg: 1000, pricePerKg: 20 },
    ],
  },
  {
    match: /بخور|incense/i,
    label: 'فحم البخور',
    inStockKg: 950,
    minOrderKg: 2,
    leadDays: 2,
    tiers: [
      { minKg: 0,   pricePerKg: 40 },
      { minKg: 25,  pricePerKg: 35 },
      { minKg: 100, pricePerKg: 30 },
    ],
  },
  {
    match: /مضغوط|compressed/i,
    label: 'الفحم المضغوط',
    inStockKg: 1600,
    minOrderKg: 10,
    leadDays: 2,
    tiers: [
      { minKg: 0,   pricePerKg: 14 },
      { minKg: 100, pricePerKg: 11 },
      { minKg: 500, pricePerKg: 9 },
    ],
  },
  {
    match: /علبة|تصدير|export|box/i,
    label: 'علبة التصدير الفاخرة',
    inStockKg: 320,
    minOrderKg: 1,
    leadDays: 3,
    tiers: [
      { minKg: 0,  pricePerKg: 120 },
      { minKg: 20, pricePerKg: 100 },
      { minKg: 80, pricePerKg: 85 },
    ],
  },
];

export type QuoteResult = {
  ok: boolean;
  item?: InventoryItem;
  qtyKg: number;
  pricePerKg: number;
  subtotal: number;
  vat: number;
  total: number;
  leadDays: number;
  issues: string[];          // blocking issues
  notes: string[];           // informational notes (e.g. tier savings)
};

const VAT_RATE = 0.15;

function toKg(qty: number, unit: string): number {
  const u = (unit || 'kg').toLowerCase();
  if (u.includes('طن') || u === 'ton' || u === 't') return qty * 1000;
  if (u.includes('كرتون') || u === 'carton') return qty * 10; // assume 10kg carton
  return qty;
}

export function quoteFor(productType: string, qty: number, unit: string): QuoteResult {
  const issues: string[] = [];
  const notes: string[] = [];
  const item = INVENTORY.find(i => i.match.test(productType || ''));
  const qtyKg = toKg(qty || 0, unit);

  if (!item) {
    issues.push('المنتج غير موجود في الكتالوج، يرجى تحديد نوع آخر.');
    return { ok: false, qtyKg, pricePerKg: 0, subtotal: 0, vat: 0, total: 0, leadDays: 0, issues, notes };
  }
  if (qtyKg < item.minOrderKg) {
    issues.push(`الحد الأدنى للطلب ${item.minOrderKg} كجم.`);
  }
  if (qtyKg > item.inStockKg) {
    issues.push(`المتوفر حالياً ${item.inStockKg.toLocaleString('ar-SA')} كجم فقط. يرجى تقليل الكمية أو طلب توريد خاص.`);
  }

  const tier = [...item.tiers].reverse().find(t => qtyKg >= t.minKg) || item.tiers[0];
  const pricePerKg = tier.pricePerKg;
  const subtotal = +(pricePerKg * qtyKg).toFixed(2);
  const vat = +(subtotal * VAT_RATE).toFixed(2);
  const total = +(subtotal + vat).toFixed(2);

  // Suggest next tier savings
  const nextTier = item.tiers.find(t => t.minKg > qtyKg);
  if (nextTier) {
    const diff = nextTier.minKg - qtyKg;
    const saving = +((pricePerKg - nextTier.pricePerKg) * nextTier.minKg).toFixed(0);
    if (saving > 0) notes.push(`بزيادة ${diff} كجم تصل لشريحة ${nextTier.pricePerKg} ر.س/كجم وتوفّر تقريباً ${saving} ر.س.`);
  }

  return {
    ok: issues.length === 0,
    item,
    qtyKg,
    pricePerKg,
    subtotal,
    vat,
    total,
    leadDays: item.leadDays,
    issues,
    notes,
  };
}

export function formatSAR(n: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(n);
}
