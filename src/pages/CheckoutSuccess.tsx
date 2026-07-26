import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <div className="min-h-[70vh] grid place-items-center px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <SeoHead title={isAr ? 'تم استلام طلبك' : 'Order received'} description={isAr ? 'تأكيد استلام طلب فحم النخلة.' : 'Palm Charcoal order confirmation.'} noindex />
      <div className="text-center max-w-md">
        <CheckCircle2 className="w-20 h-20 text-[hsl(var(--gold-hi))] mx-auto mb-6" />
        <h1 className="text-3xl font-display mb-3">{isAr ? 'تم استلام طلبك بنجاح' : 'Your order was received'}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">
          {isAr
            ? 'سنرسل لك رقم الفاتورة الضريبية وتفاصيل الشحن على البريد وواتساب خلال ساعات.'
            : 'We will send you the tax invoice and shipping details by email and WhatsApp within hours.'}
        </p>
        {orderId && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">
            {isAr ? 'رقم الطلب:' : 'Order ID:'} <code className="font-mono">{orderId}</code>
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/products" className="px-6 py-3 rounded-xl bg-[hsl(var(--gold-hi))] text-[hsl(var(--ink))] font-bold">
            {isAr ? 'مواصلة التسوق' : 'Continue shopping'}
          </Link>
          {orderId && (
            <Link to={`/orders/${orderId}`} className="px-6 py-3 rounded-xl border border-[hsl(var(--gold-hi)/0.4)]">
              {isAr ? 'تتبع الطلب' : 'Track order'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
