import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Instagram, Linkedin, Mail } from 'lucide-react';

export function LuxFooter() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-surface border-t border-gold/15 pt-20 pb-10 overflow-hidden">
      {/* Ember glow */}
      <div className="absolute inset-x-0 -top-32 h-64 ember-glow pointer-events-none animate-ember" />

      <div className="container relative grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Brand block */}
        <div className="lg:col-span-5">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <span className="w-11 h-11 rounded-full border-luxe-strong flex items-center justify-center">
              <Flame className="w-4 h-4 text-gold" />
            </span>
            <span className={`text-lg text-gold-hi ${isAr ? 'font-arabic' : 'font-display italic'}`}>
              {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
            </span>
          </Link>
          <p className="text-foreground/60 max-w-md leading-relaxed text-sm">{t('footer.tagline')}</p>

          <div className="mt-8 max-w-md">
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">{t('footer.newsletter')}</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('footer.newsletterPlaceholder')}
                className="flex-1 bg-surface-3 border-luxe rounded-full px-5 py-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-gold/50"
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
            <FooterLink to="#">{t('footer.privacy')}</FooterLink>
            <FooterLink to="#">{t('footer.terms')}</FooterLink>
            <FooterLink to="#">{t('footer.shipping')}</FooterLink>
          </FooterCol>
        </div>
      </div>

      <div className="container mt-16 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-foreground/40 tracking-wider">
          © {year} Palm Charcoal Co. — {t('footer.rights')}
        </p>
        <div className="flex items-center gap-4 text-foreground/40">
          <a href="#" aria-label="Instagram" className="hover:text-gold transition-colors duration-500">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-gold transition-colors duration-500">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="mailto:export@palmcharcoal.sa" aria-label="Email" className="hover:text-gold transition-colors duration-500">
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
      <h4 className="text-xs uppercase tracking-[0.3em] text-gold mb-5 font-body">{title}</h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-foreground/60 hover:text-gold-hi transition-colors duration-500">
        {children}
      </Link>
    </li>
  );
}
