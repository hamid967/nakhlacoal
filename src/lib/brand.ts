export const brand = {
  // Core identity — change these to rebrand the entire site
  name: 'Palm Charcoal',
  logo: 'فحم النخلة',
  tagline: ['PREMIUM SAUDI', 'PALM CHARCOAL', 'CRAFTED TO PERFECTION'],

  // Hero background video
  heroVideo: {
    src: 'https://mojli.s3.us-east-2.amazonaws.com/Mojli+Website+upscaled+(12mb).webm',
    type: 'video/webm',
  },

  // Social links (footer)
  social: {
    x: 'https://x.com/palmcharcoal',
    tiktok: 'https://www.tiktok.com/@palmcharcoal',
    instagram: 'https://www.instagram.com/palmcharcoal',
    linkedin: 'https://linkedin.com/company/palmcharcoal',
  },

  // Footer details
  footer: {
    description:
      'فحم النخلة — Premium Saudi charcoal crafted from sustainable date palm wood. Pure, long-burning, and naturally aromatic for grilling, hookah, and luxury hospitality worldwide.',
    copyrightYear: 2025,
    address: 'سوق الفحم، البلد، جدة — المملكة العربية السعودية / Charcoal Souq, Al-Balad, Jeddah, Kingdom of Saudi Arabia',
    phone: '+966 54 006 0085',
    whatsapp: 'https://wa.me/966540060085',
    email: 'nakhlacoal@gmail.com',
  },

  // Small stamps / labels used across the site
  lab: 'PALM CHARCOAL CO.',
} as const

/** Base WhatsApp number (E.164, no plus). Single source of truth. */
export const WHATSAPP_NUMBER = '966540060085'

/** Default prefilled WhatsApp messages (Arabic-first, English fallback). */
export const WHATSAPP_MESSAGES = {
  general:    'السلام عليكم، أرغب بالاستفسار عن فحم النخلة الفاخر.',
  order:      'السلام عليكم، أرغب بتقديم طلب من فحم النخلة.',
  quote:      'السلام عليكم، أرغب بطلب عرض سعر لكميات الجملة.',
  wholesale:  'السلام عليكم، أرغب باستلام قائمة أسعار الجملة (Wholesale).',
  export:     'Hello Palm Charcoal, I would like to request an export quotation.',
  support:    'السلام عليكم، أحتاج مساعدة من الدعم الفني لفحم النخلة.',
  product:    (name: string) => `السلام عليكم، أرغب بالاستفسار عن منتج: ${name}`,
} as const

/**
 * Build a WhatsApp deep link with an optional prefilled message.
 * Usage: `waLink()` · `waLink('quote')` · `waLink(WHATSAPP_MESSAGES.product('كرتون 10 كجم'))`
 */
export function waLink(message?: keyof typeof WHATSAPP_MESSAGES | string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!message) return `${base}?text=${encodeURIComponent(WHATSAPP_MESSAGES.general)}`
  const preset = (WHATSAPP_MESSAGES as Record<string, unknown>)[message as string]
  const raw = typeof preset === 'string' ? preset : (message as string)
  return `${base}?text=${encodeURIComponent(raw)}`
}


