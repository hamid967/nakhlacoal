export const brand = {
  // Core identity — change these to rebrand the entire site
  name: 'MOJJU',
  logo: 'MOJJU',
  tagline: ['AI FILM', 'PRODUCTION', 'WITHOUT LIMITS'],

  // Hero background video
  heroVideo: {
    src: 'https://mojli.s3.us-east-2.amazonaws.com/Mojli+Website+upscaled+(12mb).webm',
    type: 'video/webm',
  },

  // Social links (footer)
  social: {
    x: 'https://x.com/Mojjuai',
    tiktok: 'https://www.tiktok.com/@mojju.ai',
    instagram: 'https://www.instagram.com/mojju.ai',
    linkedin: 'https://linkedin.com/company/mojju',
  },

  // Footer details
  footer: {
    description:
      'Revolutionizing video production with intelligent AI that understands creativity, storytelling, and human emotion.',
    copyrightYear: 2025,
    address: '2847 HIGHLAND AVE. SUITE 310 BIRMINGHAM 35205, AL, USA',
  },

  // Small stamps / labels used across the site
  lab: 'MOJJU LAB',
} as const
