import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '40rem',
        md: '48rem',
        lg: '64rem',
        xl: '80rem',
        '2xl': '90rem',
      },
    },
    extend: {
      fontFamily: {
        // Palm Charcoal typography per redesign brief §4
        display:          ['"Manrope"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        body:             ['"Manrope"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        sans:             ['"Manrope"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        arabic:           ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        // Legacy aliases retained so existing components keep compiling; all resolve to Manrope + IBM Plex Arabic.
        editorial:        ['"Manrope"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        'editorial-bold': ['"Manrope"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        'editorial-sans': ['"Manrope"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        amiri:            ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
        // Brief §4 palette aliases
        coal: {
          DEFAULT: "hsl(var(--dark))",
          950:     "hsl(var(--dark))",
          900:     "hsl(var(--dark-2))",
          800:     "hsl(var(--dark-3))",
        },
        ivory: "hsl(var(--ivory))",
        sand:  "hsl(var(--sand))",
        ember: {
          DEFAULT: "hsl(var(--ember))",
          hi:      "hsl(var(--ember-hi))",
        },
        'palm-gold': {
          DEFAULT: "hsl(var(--gold))",
          hi:      "hsl(var(--gold-hi))",
          lo:      "hsl(var(--gold-lo))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          hi: "hsl(var(--gold-hi))",
          lo: "hsl(var(--gold-lo))",
          ink: "hsl(var(--gold-ink))",
        },
        jade: "hsl(var(--jade))",
        success: "hsl(var(--success))",
        whatsapp: {
          DEFAULT: "hsl(var(--brand-whatsapp))",
          hover: "hsl(var(--brand-whatsapp-hover))",
        },
        dark: {
          DEFAULT: "hsl(var(--dark))",
          2: "hsl(var(--dark-2))",
          foreground: "hsl(var(--dark-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        // brand tokens (see src/lib/brandTokens.ts → radii)
        'brand-sm':  '4px',
        'brand-md':  '8px',
        'brand-lg':  '16px',
        'brand-xl':  '24px',
        'brand-2xl': '32px',
        'brand-pill':'9999px',
      },
      spacing: {
        // brand tokens (see src/lib/brandTokens.ts → spacing)
        'brand-xs':  '4px',
        'brand-sm':  '8px',
        'brand-md':  '16px',
        'brand-lg':  '24px',
        'brand-xl':  '40px',
        'brand-2xl': '64px',
        'brand-3xl': '96px',
        'brand-4xl': '128px',
      },
      boxShadow: {
        luxe:         "var(--shadow-luxe)",
        gold:         "var(--shadow-gold)",
        soft:         "0 1px 2px hsl(var(--dark) / 0.06), 0 4px 12px hsl(var(--dark) / 0.06)",
        card:         "0 8px 24px hsl(var(--dark) / 0.10)",
        lift:         "0 24px 60px hsl(var(--dark) / 0.18)",
        'glow-gold':  "0 10px 28px -8px hsl(var(--gold) / 0.60)",
        'glow-gold-sm':"0 0 18px -4px hsl(var(--gold) / 0.60)",
      },
      transitionDuration: {
        fast:      '180ms',
        base:      '320ms',
        slow:      '560ms',
        cinematic: '1200ms',
      },
      transitionTimingFunction: {
        brand:          'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'brand-in':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'brand-out':    'cubic-bezier(0.4, 0, 1, 1)',
      },
      backgroundImage: {
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-ember': 'var(--gradient-ember)',
        'gradient-night': 'var(--gradient-night)',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scan: "scan 2.4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
