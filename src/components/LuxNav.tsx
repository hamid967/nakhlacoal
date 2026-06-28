import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Flame } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

const navItems = [
  { to: '/', key: 'nav.home' },
  { to: '/products', key: 'nav.products' },
  { to: '/about', key: 'nav.about' },
  { to: '/quality', key: 'nav.quality' },
  { to: '/wholesale', key: 'nav.wholesale' },
  { to: '/export', key: 'nav.export' },
  { to: '/knowledge', key: 'nav.knowledge' },
  { to: '/contact', key: 'nav.contact' },
];

export function LuxNav() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const isAr = i18n.language?.startsWith('ar');

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${
          scrolled ? 'glass-luxe py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container flex items-center justify-between gap-6">
          {/* Brand mark */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full border-luxe-strong">
              <Flame className="w-4 h-4 text-gold transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 rounded-full bg-gold/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </span>
            <span className="flex flex-col leading-none">
              <span className={`text-base tracking-[0.15em] text-gold-hi ${isAr ? 'font-arabic' : 'font-display italic'}`}>
                {isAr ? 'فحم النخلة' : 'PALM CHARCOAL'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-foreground/50 mt-1">
                {isAr ? 'Premium Saudi' : 'فحم النخلة'}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative text-xs uppercase tracking-[0.22em] transition-colors duration-500 ${
                      isActive ? 'text-gold-hi' : 'text-foreground/70 hover:text-gold-hi'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="relative inline-block py-2">
                      {t(item.key)}
                      <span
                        className={`absolute -bottom-0.5 inset-x-0 h-px bg-gold transition-transform duration-500 origin-left ${
                          isActive ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <LanguageToggle compact />
            <Link to="/contact" className="hidden md:inline-flex btn-gold !px-5 !py-2.5 text-xs">
              {t('nav.order')}
            </Link>
            <button
              className="lg:hidden w-10 h-10 rounded-full border-luxe flex items-center justify-center text-gold"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" onClick={() => setOpen(false)} />
        <div
          className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} h-full w-[85vw] max-w-sm bg-surface border-luxe ${
            isAr ? 'border-r' : 'border-l'
          } p-8 transition-transform duration-700 ${
            open ? 'translate-x-0' : isAr ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-12">
            <span className={`text-lg text-gold-hi ${isAr ? 'font-arabic' : 'font-display italic'}`}>
              {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
            </span>
            <button
              className="w-10 h-10 rounded-full border-luxe flex items-center justify-center text-gold"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `block py-4 text-sm uppercase tracking-[0.22em] border-b border-gold/10 ${
                      isActive ? 'text-gold-hi' : 'text-foreground/80'
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="btn-gold mt-10 w-full">
            {t('nav.order')}
          </Link>
        </div>
      </div>
    </>
  );
}
