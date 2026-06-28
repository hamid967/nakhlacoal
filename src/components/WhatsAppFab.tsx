import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import { OrderModal } from './OrderModal';
import logo from '@/assets/palm-charcoal-logo.png';

const WHATSAPP_NUMBER = '966501234567';

export function WhatsAppFab() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(false);

  const waText = isAr
    ? 'مرحباً فحم النخلة 👋، أرغب بمعرفة المزيد عن المنتجات وتقديم طلب.'
    : "Hi Palm Charcoal 👋, I'd like to learn more about your products and place an order.";
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <>
      {/* Action popover */}
      <div
        className={`fixed bottom-24 end-6 z-50 w-64 rounded-2xl border border-gold/30 bg-background/95 backdrop-blur-lg shadow-gold p-3 transition-all duration-300 origin-bottom ${
          open ? 'opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-95 translate-y-2'
        }`}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="flex items-center gap-2 px-1 pb-2 border-b border-gold/15">
          <img src={logo} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-dark leading-tight font-arabic">
              {isAr ? 'مساعد فحم النخلة AI' : 'Palm Charcoal AI'}
            </p>
            <p className="text-[10px] text-foreground/60">{isAr ? 'متصل الآن' : 'Online now'}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <button
          onClick={() => { setOrder(true); setOpen(false); }}
          className="mt-2 w-full text-start text-sm px-3 py-2 rounded-lg hover:bg-gold/10 transition flex items-center gap-2 font-arabic"
        >
          <Sparkles className="w-4 h-4 text-gold-hi" />
          {isAr ? 'اطلب الآن (نموذج ذكي)' : 'Place a smart order'}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer noopener"
          className="w-full text-start text-sm px-3 py-2 rounded-lg hover:bg-gold/10 transition flex items-center gap-2 font-arabic"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          {isAr ? 'مراسلة مباشرة عبر واتساب' : 'Chat on WhatsApp'}
        </a>
      </div>

      {/* Branded AI FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? 'مساعد فحم النخلة الذكي' : 'Palm Charcoal AI assistant'}
        aria-expanded={open}
        className="fixed bottom-6 end-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-gold transition-transform duration-500 hover:scale-110 group"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, hsl(var(--gold-hi)) 0%, hsl(var(--gold)) 45%, hsl(var(--dark)) 100%)',
        }}
      >
        <span className="absolute inset-0 rounded-full bg-gold/30 motion-safe:animate-ping" />
        <span className="relative w-12 h-12 rounded-full bg-dark flex items-center justify-center overflow-hidden">
          {open ? (
            <X className="w-5 h-5 text-gold-hi" />
          ) : (
            <img src={logo} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          )}
        </span>
        {!open && (
          <Sparkles className="absolute -top-1 -end-1 w-5 h-5 text-gold-hi drop-shadow-[0_0_6px_hsl(var(--gold-hi))] motion-safe:animate-pulse" />
        )}
      </button>

      <OrderModal open={order} onOpenChange={setOrder} />
    </>
  );
}
