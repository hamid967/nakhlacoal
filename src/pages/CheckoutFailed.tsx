import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function CheckoutFailed() {
  const [params] = useSearchParams();
  const reason = params.get('reason');
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const label = (() => {
    switch (reason) {
      case 'price_mismatch': return isAr ? 'تغيّر السعر أثناء الدفع، حدّث السلة وأعد المحاولة.' : 'Price changed during checkout. Refresh your cart and retry.';
      case 'insufficient_stock': return isAr ? 'أحد المنتجات لم يعد متوفرًا بالكمية المطلوبة.' : 'One of the items is no longer available in the requested quantity.';
      case 'payment_declined': return isAr ? 'تم رفض عملية الدفع من قِبل البنك.' : 'The payment was declined by your bank.';
      default: return isAr ? 'تعذّر إتمام الطلب. تواصل معنا وسنساعدك.' : 'We could not complete your order. Contact us and we will help.';
    }
  })();

  return (
    <div className="min-h-[70vh] grid place-items-center px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <SeoHead title={isAr ? 'تعذّر إتمام الطلب' : 'Order failed'} description={isAr ? 'حدث خطأ أثناء إتمام الطلب.' : 'An error occurred during checkout.'} noindex />
      <div className="text-center max-w-md">
        <XCircle className="w-20 h-20 text-[hsl(var(--destructive,0_84%_60%))] mx-auto mb-6" />
        <h1 className="text-3xl font-display mb-3">{isAr ? 'تعذّر إتمام طلبك' : 'We could not complete your order'}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">{label}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/checkout" className="px-6 py-3 rounded-xl bg-[hsl(var(--gold-hi))] text-[hsl(var(--ink))] font-bold">
            {isAr ? 'العودة إلى الدفع' : 'Back to checkout'}
          </Link>
          <a href="https://wa.me/966540060085" className="px-6 py-3 rounded-xl border border-[hsl(var(--gold-hi)/0.4)]">
            {isAr ? 'تواصل عبر واتساب' : 'Contact on WhatsApp'}
          </a>
        </div>
      </div>
    </div>
  );
}
