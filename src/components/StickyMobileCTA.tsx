import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { OrderModal } from './OrderModal';
import { trackWhatsApp, trackConversion } from '@/lib/track';

const WHATSAPP = 'https://wa.me/966540060085';

/**
 * Sticky bottom CTA bar — mobile only. Appears after the user scrolls past the hero
 * to keep the primary actions one tap away.
 */
export function StickyMobileCTA() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [visible, setVisible] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),0.5rem)] px-3 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-card rounded-2xl border border-gold/20 shadow-xl p-2 flex items-center gap-2">
          <button
            onClick={() => { trackConversion('order_open', { source: 'sticky_mobile' }); setOrderOpen(true); }}
            className="btn-gold flex-1 min-h-12 !py-3 !text-sm !rounded-xl inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {isAr ? 'اطلب الآن' : 'Order now'}
          </button>
          <a
            href={WHATSAPP}
            onClick={() => trackWhatsApp('sticky_mobile')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="min-h-12 min-w-12 rounded-xl border border-gold/40 inline-flex items-center justify-center text-gold-ink hover:bg-gold/5 transition"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
      <OrderModal open={orderOpen} onOpenChange={setOrderOpen} />
    </>
  );
}
