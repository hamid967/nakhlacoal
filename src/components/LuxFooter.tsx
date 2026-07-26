import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Linkedin, Mail } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { brand } from '@/lib/brand';

export function LuxFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative section-dark pt-20 pb-10 overflow-hidden">
      {/* Ember glow */}
      <div className="absolute inset-x-0 -top-32 h-64 ember-glow pointer-events-none animate-ember" />

      <div className="container relative">
        <div className="glass-card rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Brand block */}
        <div className="lg:col-span-5">
          <Link to="/" className="inline-flex items-center gap-3 mb-6" aria-label="Palm Charcoal">
            <BrandLogo alt="فحم النخلة Palm Charcoal" width={80} height={80} className="h-20 w-auto" />
          </Link>
          <p className="text-foreground/85 max-w-md leading-relaxed text-sm">{t('footer.tagline')}</p>

          <div className="mt-8 max-w-md">
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">{t('footer.newsletter')}</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('footer.newsletterPlaceholder')}
                className="flex-1 glass-strip rounded-full px-5 py-3 text-sm placeholder:text-foreground/70 focus:outline-none focus:border-gold/50"
              />
              <button className="btn-gold !px-5 !py-3 text-xs">{t('footer.subscribe')}</button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
          <FooterCol title={t('footer.company')}>
            <FooterLink to="/about">{t('nav.about')}</FooterLink>
            <FooterLink to="/quality">{t('nav.quality')}</FooterLink>
            <FooterLink to="/knowledge">{t('nav.knowledge')}</FooterLink>
            <FooterLink to="/contact">{t('nav.contact')}</FooterLink>
          </FooterCol>
          <FooterCol title={t('footer.products')}>
            <FooterLink to="/products">{t('nav.products')}</FooterLink>
            <FooterLink to="/wholesale">{t('nav.wholesale')}</FooterLink>
            <FooterLink to="/export">{t('nav.export')}</FooterLink>
            <FooterLink to="/contact">{t('products.requestQuote')}</FooterLink>
          </FooterCol>
          <FooterCol title={t('footer.legal')}>
            <FooterLink to="/contact">{t('footer.privacy')}</FooterLink>
            <FooterLink to="/contact">{t('footer.terms')}</FooterLink>
            <FooterLink to="/contact">{t('footer.shipping')}</FooterLink>
          </FooterCol>
        </div>
        </div>
      </div>

      <div className="container mt-16 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-foreground/70 tracking-wider">
          © {year} Palm Charcoal Co. — {t('footer.rights')}
        </p>
        <div className="flex items-center gap-4 text-foreground/70">
          <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold transition-colors duration-500">
            <Instagram className="w-4 h-4" />
          </a>
          <a href={brand.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gold transition-colors duration-500">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href={`mailto:${brand.footer.email}`} aria-label="Email" className="hover:text-gold transition-colors duration-500">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold mb-5 font-body">{title}</h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-foreground/85 hover:text-gold-hi transition-colors duration-500">
        {children}
      </Link>
    </li>
  );
}
