import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { OrderModal } from './OrderModal';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/palm-charcoal-logo.png';


const navItems = [
  { to: '/', key: 'nav.home' },
  { to: '/products', key: 'nav.products' },
  { to: '/uses', key: 'nav.uses' },
  { to: '/about', key: 'nav.about' },
  { to: '/quality', key: 'nav.quality' },
  { to: '/trademarks', key: 'nav.trademarks' },
  { to: '/export', key: 'nav.export' },
  { to: '/articles', key: 'nav.articles' },
  { to: '/contact', key: 'nav.contact' },
];

export function LuxNav() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
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
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 glass-luxe ${
          scrolled ? 'py-2 shadow-luxe' : 'py-3'
        }`}
      >
        <div className="container flex items-center justify-between gap-6">
          {/* Brand mark */}
          <Link to="/" className="group flex items-center gap-2" aria-label="Palm Charcoal">
            <img src={logo} alt="فحم النخلة Palm Charcoal" width={56} height={56} className="h-12 w-auto md:h-14 transition-transform duration-700 group-hover:scale-105" />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative text-sm font-arabic font-medium transition-colors duration-300 ${
                      isActive ? 'text-gold-hi' : 'text-foreground/80 hover:text-gold-hi'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="relative inline-block py-2">
                      {t(item.key)}
                      <span
                        className={`absolute -bottom-0.5 inset-x-0 h-0.5 bg-gold rounded-full transition-transform duration-500 origin-center ${
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
          <div className="flex items-center gap-2 md:gap-3">
            <AccountButton />
            <button aria-label="Cart" className="hidden md:inline-flex w-10 h-10 rounded-full items-center justify-center text-foreground/70 hover:text-gold-hi transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <LanguageToggle compact />
            <button onClick={() => setOrderOpen(true)} className="hidden md:inline-flex btn-gold !px-5 !py-2.5 text-xs">
              {t('nav.order')}
            </button>
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
            <img src={logo} alt="Palm Charcoal" width={48} height={48} className="h-12 w-auto" />
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
          <button onClick={() => { setOpen(false); setOrderOpen(true); }} className="btn-gold mt-10 w-full">
            {t('nav.order')}
          </button>
        </div>
      </div>
      <OrderModal open={orderOpen} onOpenChange={setOrderOpen} />
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
        className="hidden md:inline-flex w-10 h-10 rounded-full items-center justify-center text-foreground/70 hover:text-gold-hi transition-colors"
      >
        <User className="w-4 h-4" />
      </Link>
    );
  }
  return (
    <button
      onClick={signOut}
      aria-label={isAr ? 'تسجيل الخروج' : 'Sign out'}
      title={user.email ?? ''}
      className="hidden md:inline-flex w-10 h-10 rounded-full items-center justify-center text-foreground/70 hover:text-gold-hi transition-colors"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
