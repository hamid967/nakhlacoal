// Indicative retail prices per kg in SAR. Used by the QuoteBuilder.
// Final pricing is confirmed by the sales team after quote submission.
export type PriceTier = { unit: 'kg' | 'carton' | 'ton'; sar: number; minQty: number };

export const PRICING: Record<string, PriceTier[]> = {
  bbq:        [{ unit: 'kg', sar: 18, minQty: 1 }, { unit: 'kg', sar: 16, minQty: 50 }, { unit: 'ton', sar: 13000, minQty: 1 }],
  coconut:    [{ unit: 'kg', sar: 28, minQty: 1 }, { unit: 'kg', sar: 25, minQty: 50 }, { unit: 'ton', sar: 21000, minQty: 1 }],
  hookah:     [{ unit: 'carton', sar: 95, minQty: 1 }, { unit: 'carton', sar: 85, minQty: 20 }],
  incense:    [{ unit: 'carton', sar: 45, minQty: 1 }, { unit: 'carton', sar: 38, minQty: 30 }],
  compressed: [{ unit: 'kg', sar: 14, minQty: 1 }, { unit: 'ton', sar: 11000, minQty: 1 }],
  export:     [{ unit: 'ton', sar: 12500, minQty: 5 }],
};

export const VAT_RATE = 0.15;

export function bestPrice(slug: string, qty: number, unit: 'kg' | 'carton' | 'ton'): number {
  const tiers = (PRICING[slug] || []).filter((t) => t.unit === unit && qty >= t.minQty);
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((t) => t.sar));
}

export function availableUnits(slug: string): Array<'kg' | 'carton' | 'ton'> {
  return Array.from(new Set((PRICING[slug] || []).map((t) => t.unit)));
}
