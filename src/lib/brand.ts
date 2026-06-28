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
    address: 'King Fahd Road, Riyadh 12241, Kingdom of Saudi Arabia',
  },

  // Small stamps / labels used across the site
  lab: 'PALM CHARCOAL CO.',
} as const
