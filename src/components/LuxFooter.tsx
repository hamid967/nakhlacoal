import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Linkedin, Mail, MapPin, Phone, Send, Check, Loader2 } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { brand } from '@/lib/brand';
import { supabase } from '@/integrations/supabase/client';

/**
 * LuxFooter — Palm Charcoal identity (Coal ground · Palm-Gold accents).
 * Four link columns, wired newsletter, contact block, and legal strip.
 */
export function LuxFooter() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const year = new Date().getFullYear();

  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      setState('err');
      return;
    }
    setState('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: clean,
      locale: isAr ? 'ar' : 'en',
      source: 'footer',
    });
    if (error && !/duplicate|unique/i.test(error.message)) {
      setState('err');
      return;
    }
    setState('ok');
    setEmail('');
  }

  return (
    <footer
      className="relative bg-dark text-dark-foreground pt-20 pb-10 overflow-hidden"
      role="contentinfo"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-24 h-56 pointer-events-none"
        style={{ background: 'var(--gradient-ember)', opacity: 0.35 }}
      />

      <div className="container relative grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10">
        {/* Brand + Newsletter */}
        <div className="lg:col-span-5" dir={isAr ? 'rtl' : 'ltr'}>
          <Link to="/" className="inline-flex items-center gap-3 mb-6" aria-label="Palm Charcoal">
            <BrandLogo alt="فحم النخلة Palm Charcoal" width={72} height={72} className="h-16 w-auto" />
            <span className="font-editorial-bold text-gold-hi text-xl leading-none">
              {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
            </span>
          </Link>
          <p className="text-dark-foreground/70 max-w-md leading-relaxed text-sm">
            {isAr
              ? 'فحم سعودي فاخر من نخيل الجزيرة العربية — كربنة نقية، احتراق طويل، رماد شبه معدوم.'
              : 'Premium Saudi charcoal from Arabian palm — pure carbon, long burn, near-zero ash.'}
          </p>

          <form onSubmit={subscribe} className="mt-8 max-w-md" noValidate>
            <label htmlFor="footer-email" className="block text-[10px] uppercase tracking-[0.32em] text-gold mb-3">
              {isAr ? 'انضم إلى النشرة' : 'Join the dispatch'}
            </label>
            <div className="flex gap-2">
              <input
                id="footer-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'err') setState('idle');
                }}
                placeholder={isAr ? 'بريدك@الإلكتروني.com' : 'you@address.com'}
                className="flex-1 h-11 px-4 bg-transparent border border-gold/40 text-dark-foreground text-sm placeholder:text-dark-foreground/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                dir="ltr"
                aria-invalid={state === 'err'}
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-br from-gold-hi to-gold-lo text-dark font-semibold text-xs uppercase tracking-[0.18em] hover:-translate-y-0.5 hover:shadow-glow-gold transition-all disabled:opacity-60"
                aria-label={isAr ? 'اشترك' : 'Subscribe'}
              >
                {state === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : state === 'ok' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {state === 'ok' ? (isAr ? 'تم' : 'Done') : t('footer.subscribe')}
                </span>
              </button>
            </div>
            {state === 'err' ? (
              <p role="alert" className="mt-2 text-xs text-ember-hi">
                {isAr ? 'أدخل بريداً صحيحاً' : 'Please enter a valid email'}
              </p>
            ) : null}
          </form>
        </div>

        {/* Link columns */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-10" dir={isAr ? 'rtl' : 'ltr'}>
          <FooterCol title={isAr ? 'الشركة' : 'Company'}>
            <FooterLink to="/about">{isAr ? 'عن فحم النخلة' : 'About'}</FooterLink>
            <FooterLink to="/our-story">{isAr ? 'قصتنا' : 'Our Story'}</FooterLink>
            <FooterLink to="/sustainability">{isAr ? 'الاستدامة' : 'Sustainability'}</FooterLink>
            <FooterLink to="/quality">{isAr ? 'الجودة' : 'Quality Lab'}</FooterLink>
            <FooterLink to="/trademarks">{isAr ? 'علاماتنا' : 'Trademarks'}</FooterLink>
          </FooterCol>

          <FooterCol title={isAr ? 'المنتجات' : 'Products'}>
            <FooterLink to="/products">{isAr ? 'كل المنتجات' : 'All Products'}</FooterLink>
            <FooterLink to="/wholesale">{isAr ? 'الجملة' : 'Wholesale'}</FooterLink>
            <FooterLink to="/export">{isAr ? 'التصدير' : 'Export'}</FooterLink>
            <FooterLink to="/catalog">{isAr ? 'الكتالوج PDF' : 'Catalog PDF'}</FooterLink>
            <FooterLink to="/quote">{isAr ? 'طلب عرض سعر' : 'Request a Quote'}</FooterLink>
          </FooterCol>

          <FooterCol title={isAr ? 'المعرفة' : 'Knowledge'}>
            <FooterLink to="/journal">{isAr ? 'المدوّنة' : 'The Journal'}</FooterLink>
            <FooterLink to="/uses">{isAr ? 'الاستخدامات' : 'Uses'}</FooterLink>
            <FooterLink to="/faq">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</FooterLink>
            <FooterLink to="/verify-batch">{isAr ? 'تحقّق من الدفعة' : 'Verify Batch'}</FooterLink>
            <FooterLink to="/track-order">{isAr ? 'تتبع الطلب' : 'Track Order'}</FooterLink>
          </FooterCol>

          <FooterCol title={isAr ? 'الدعم' : 'Support'}>
            <FooterLink to="/contact">{isAr ? 'تواصل معنا' : 'Contact'}</FooterLink>
            <FooterLink to="/shipping-returns">{isAr ? 'الشحن والإرجاع' : 'Shipping & Returns'}</FooterLink>
            <FooterLink to="/portal">{isAr ? 'بوابة العملاء' : 'Customer Portal'}</FooterLink>
            <FooterLink to="/auth">{isAr ? 'تسجيل الدخول' : 'Sign In'}</FooterLink>
          </FooterCol>
        </div>
      </div>

      {/* Contact strip */}
      <div className="container relative mt-14 pt-8 border-t border-gold/15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm" dir={isAr ? 'rtl' : 'ltr'}>
          <ContactBit icon={MapPin} label={isAr ? 'العنوان' : 'Address'}>
            {isAr
              ? 'سوق الفحم، البلد، جدة — المملكة العربية السعودية'
              : 'Charcoal Souq, Al-Balad, Jeddah — Saudi Arabia'}
          </ContactBit>
          <ContactBit icon={Phone} label={isAr ? 'الهاتف' : 'Phone'}>
            <a
              href={`tel:${brand.footer.phone.replace(/\s/g, '')}`}
              className="hover:text-gold-hi transition-colors"
              dir="ltr"
            >
              {brand.footer.phone}
            </a>
          </ContactBit>
          <ContactBit icon={Mail} label={isAr ? 'البريد' : 'Email'}>
            <a
              href={`mailto:${brand.footer.email}`}
              className="hover:text-gold-hi transition-colors"
              dir="ltr"
            >
              {brand.footer.email}
            </a>
          </ContactBit>
        </div>
      </div>

      {/* Legal / bottom bar */}
      <div className="container relative mt-10 pt-6 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] tracking-wider text-dark-foreground/55">
          © {year} Palm Charcoal Co. — {t('footer.rights')} · CR 4030000000
        </p>

        <div className="flex items-center gap-5 text-dark-foreground/60">
          <a
            href={brand.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-gold-hi transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href={brand.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-gold-hi transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${brand.footer.email}`}
            aria-label="Email"
            className="hover:text-gold-hi transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-dark-foreground/45">
          <Link to="/privacy" className="hover:text-gold-hi transition-colors">
            {isAr ? 'الخصوصية' : 'Privacy'}
          </Link>
          <span className="h-3 w-px bg-gold/20" />
          <Link to="/terms" className="hover:text-gold-hi transition-colors">
            {isAr ? 'الشروط' : 'Terms'}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[10px] uppercase tracking-[0.32em] text-gold mb-5 font-body">
        {title}
      </h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-dark-foreground/70 hover:text-gold-hi transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function ContactBit({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid place-items-center w-9 h-9 rounded-full border border-gold/30 text-gold-hi shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div>
        <div className="text-[10px] uppercase tracking-[0.32em] text-gold-hi/70 mb-1">
          {label}
        </div>
        <div className="text-sm text-dark-foreground/85 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
