import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { OrderModal } from './OrderModal';
import { QuoteBuilder } from './QuoteBuilder';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/palm-charcoal-logo.png';

type MegaItem = { to: string; titleAr: string; titleEn: string; descAr?: string; descEn?: string };

type NavEntry =
  | { type: 'link'; to: string; key: string }
  | { type: 'mega'; key: string; to: string; columns: MegaItem[] };

const navItems: NavEntry[] = [
  { type: 'link', to: '/', key: 'nav.home' },
  {
    type: 'mega',
    key: 'nav.products',
    to: '/products',
    columns: [
      { to: '/products', titleAr: 'كل المنتجات', titleEn: 'All Products', descAr: 'تشكيلة فحم النخلة الكاملة', descEn: 'Full Palm Charcoal range' },
      { to: '/compare', titleAr: 'مقارنة', titleEn: 'Compare', descAr: 'قارن المنتجات جنبًا إلى جنب', descEn: 'Compare side by side' },
      { to: '/catalog', titleAr: 'الكتالوج PDF', titleEn: 'Catalog PDF', descAr: 'كتالوج مطبوع للجملة', descEn: 'Printable wholesale catalog' },
      { to: '/wholesale', titleAr: 'الجملة', titleEn: 'Wholesale', descAr: 'أسعار وشروط الجملة', descEn: 'B2B pricing & terms' },
      { to: '/export', titleAr: 'التصدير', titleEn: 'Export', descAr: 'حلول التصدير الدولية', descEn: 'Global export solutions' },
    ],
  },
  { type: 'link', to: '/about', key: 'nav.about' },
  { type: 'link', to: '/quality', key: 'nav.quality' },
  {
    type: 'mega',
    key: 'nav.knowledge',
    to: '/articles',
    columns: [
      { to: '/uses', titleAr: 'الاستخدامات', titleEn: 'Uses', descAr: 'شيشة، شواء، مطاعم', descEn: 'Shisha, BBQ, restaurants' },
      { to: '/trademarks', titleAr: 'علاماتنا', titleEn: 'Trademarks', descAr: '٥ علامات مسجّلة', descEn: '5 registered marks' },
      { to: '/articles', titleAr: 'المقالات', titleEn: 'Articles', descAr: 'مدوّنة الفحم الفاخر', descEn: 'Premium charcoal blog' },
    ],
  },
  { type: 'link', to: '/contact', key: 'nav.contact' },
];

export function LuxNav() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setActiveMega(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const isAr = i18n.language?.startsWith('ar');

  const openMega = (key: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setActiveMega(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActiveMega(null), 140);
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 lux-emerald-nav ${
          scrolled ? 'py-3' : 'py-5'
        }`}
        onMouseLeave={scheduleClose}
      >
        <div className="container flex items-center justify-between gap-6">
          <Link to="/" className="group flex items-center gap-3 shrink-0" aria-label="Palm Charcoal">
            <span className="relative">
              <span className="absolute inset-0 rounded-full bg-gold/25 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={logo}
                alt="فحم النخلة Palm Charcoal"
                width={56}
                height={56}
                className={`relative w-auto transition-all duration-700 group-hover:scale-105 ${scrolled ? 'h-9 md:h-10' : 'h-11 md:h-12'}`}
              />
            </span>
            <span className={`hidden sm:inline lux-emerald-wordmark font-bold transition-all duration-500 ${scrolled ? 'text-xl' : 'text-2xl xl:text-[1.65rem]'}`}>
              فحم النخلة
            </span>
          </Link>

          {/* Desktop nav — gold underline links */}
          <ul className="hidden lg:flex flex-nowrap items-center gap-7 xl:gap-10">
            {navItems.map((item) => {
              if (item.type === 'link') {
                return (
                  <li key={item.to} onMouseEnter={() => setActiveMega(null)}>
                    <NavLink to={item.to} end={item.to === '/'} className="block">
                      {({ isActive }) => (
                        <span className="lux-emerald-link font-arabic" data-active={isActive}>
                          {t(item.key)}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              }
              const expanded = activeMega === item.key;
              const childActive = item.columns.some((c) => location.pathname === c.to || location.pathname.startsWith(c.to + '/'));
              return (
                <li
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => openMega(item.key)}
                  onFocus={() => openMega(item.key)}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    onClick={() => setActiveMega(expanded ? null : item.key)}
                    className="block"
                  >
                    <span
                      className="lux-emerald-link font-arabic inline-flex items-center gap-1"
                      data-active={childActive || expanded}
                    >
                      {t(item.key)}
                      <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5 md:gap-2">
            <AccountButton />
            <button aria-label="Cart" className="hidden xl:inline-flex lux-emerald-icon-btn">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <ThemeToggle />
            <LanguageToggle compact />
            <button
              onClick={() => setOrderOpen(true)}
              className="hidden md:inline-flex lux-emerald-cta font-arabic whitespace-nowrap"
            >
              <span className="lux-cta-fill" aria-hidden="true" />
              <span className="lux-cta-label">{t('nav.order')}</span>
            </button>
            <button
              className="lg:hidden lux-emerald-icon-btn w-11 h-11"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Megamenu panel */}
        <div
          className={`hidden lg:block absolute inset-x-0 top-full transition-all duration-300 ${
            activeMega ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
          onMouseEnter={() => activeMega && openMega(activeMega)}
          onMouseLeave={scheduleClose}
        >
          <div className="container pt-3">
            <div className="lux-emerald-mega rounded-2xl p-6 shadow-2xl">
              {navItems.map((item) => {
                if (item.type !== 'mega' || activeMega !== item.key) return null;
                return (
                  <div key={item.key} className="grid grid-cols-[1fr_2fr] gap-6">
                    {/* Eyebrow column */}
                    <div className="hidden md:flex flex-col justify-between border-e border-gold/25 pe-6">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.32em] text-gold-hi/70 font-arabic mb-3">
                          {isAr ? 'القائمة' : 'Menu'}
                        </div>
                        <div className="lux-emerald-wordmark text-3xl xl:text-4xl">
                          {t(item.key)}
                        </div>
                        <div className="mt-3 text-xs text-background/65 font-arabic leading-relaxed max-w-[22ch]">
                          {isAr
                            ? 'استكشف تشكيلتنا الفاخرة وخدمات الجملة والتصدير من فحم النخلة.'
                            : 'Explore our premium range, wholesale and export services from Palm Charcoal.'}
                        </div>
                      </div>
                      <Link
                        to={item.to}
                        onClick={() => setActiveMega(null)}
                        className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-gold-hi hover:text-gold transition-colors font-arabic"
                      >
                        {isAr ? 'عرض الكل ←' : 'View all →'}
                      </Link>
                    </div>

                    {/* Items grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.columns.map((col) => (
                        <NavLink
                          key={col.to}
                          to={col.to}
                          end
                          onClick={() => setActiveMega(null)}
                          className={({ isActive }) =>
                            `lux-emerald-mega-item group ${isActive ? 'is-active' : ''}`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className={`text-sm font-semibold font-arabic transition-colors ${isActive ? 'text-gold-hi' : 'text-background group-hover:text-gold-hi'}`}>
                                {isAr ? col.titleAr : col.titleEn}
                              </div>
                              <div className="text-xs text-background/55 mt-1 font-arabic">
                                {isAr ? col.descAr : col.descEn}
                              </div>
                            </>
                          )}
                        </NavLink>
                      ))}
                      <button
                        onClick={() => { setActiveMega(null); setQuoteOpen(true); }}
                        className="lux-emerald-mega-item lux-emerald-mega-cta group text-start"
                      >
                        <div className="text-sm font-semibold text-gold-hi font-arabic">
                          {isAr ? 'طلب عرض سعر' : 'Request a quote'}
                        </div>
                        <div className="text-xs text-background/60 mt-1 font-arabic">
                          {isAr ? 'مخصّص للجملة والتصدير' : 'Tailored for B2B & export'}
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={() => setOpen(false)} />
        <aside
          className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} h-dvh w-[85vw] max-w-sm glass-card glass-dark glass-grain rounded-none ${
            open ? 'translate-x-0' : isAr ? '-translate-x-full' : 'translate-x-full'
          } transition-transform duration-500 ease-out p-8 overflow-y-auto shadow-2xl`}

        >
          <div className="flex items-center justify-between mb-10">
            <img src={logo} alt="Palm Charcoal" width={48} height={48} className="h-12 w-auto" />
            <button
              className="w-11 h-11 rounded-full border-luxe flex items-center justify-center text-gold"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.type === 'link' ? item.to : item.key}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `block py-4 text-sm uppercase tracking-[0.22em] border-b border-gold/10 font-arabic ${
                      isActive ? 'text-gold-hi' : 'text-foreground/80'
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
                {item.type === 'mega' && (
                  <ul className="ps-3 pb-2">
                    {item.columns.map((col) => (
                      <li key={col.to}>
                        <NavLink
                          to={col.to}
                          end
                          className={({ isActive }) =>
                            `block py-2 text-xs font-arabic transition-colors ${isActive ? 'text-gold-hi' : 'text-foreground/60 hover:text-gold-ink'}`
                          }
                        >
                          • {isAr ? col.titleAr : col.titleEn}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            <button onClick={() => { setOpen(false); setOrderOpen(true); }} className="btn-gold w-full min-h-12">
              {t('nav.order')}
            </button>
            <button
              onClick={() => { setOpen(false); setQuoteOpen(true); }}
              className="w-full min-h-12 rounded-full border border-gold/40 text-gold-ink font-arabic text-sm hover:bg-gold/5 transition"
            >
              {isAr ? 'طلب عرض سعر' : 'Request a quote'}
            </button>
          </div>
        </aside>
      </div>
      <OrderModal open={orderOpen} onOpenChange={setOrderOpen} />
      <QuoteBuilder open={quoteOpen} onOpenChange={setQuoteOpen} />
    </>
  );
}

function AccountButton() {
  const { user, signOut } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  if (!user) {
    return (
      <Link
        to="/auth"
        aria-label={isAr ? 'تسجيل الدخول' : 'Sign in'}
        className="hidden md:inline-flex lux-emerald-icon-btn w-11 h-11"
      >
        <User className="w-4 h-4" />
      </Link>
    );
  }
  return (
    <div className="hidden md:inline-flex items-center gap-1">
      <Link
        to="/profile"
        aria-label={isAr ? 'الملف الشخصي' : 'Profile'}
        title={user.email ?? ''}
        className="lux-emerald-icon-btn w-11 h-11"
      >
        <User className="w-4 h-4" />
      </Link>
      <button
        onClick={signOut}
        aria-label={isAr ? 'تسجيل الخروج' : 'Sign out'}
        className="lux-emerald-icon-btn w-11 h-11"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
