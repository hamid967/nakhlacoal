import { useTranslation } from 'react-i18next';
import { LegalPage } from '@/components/legal/LegalPage';

export default function RefundPolicy() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <LegalPage
      slug="refund-policy"
      titleAr="سياسة الاسترجاع والاستبدال"
      titleEn="Refund & Return Policy"
      descAr="سياسة استرجاع واستبدال منتجات فحم النخلة — المدد، الشروط، وطريقة استرداد المبلغ."
      descEn="Palm Charcoal return & refund policy — timeframes, conditions, and how you get your money back."
      updatedAt="2026-07-26"
    >
      {isAr ? (
        <>
          <h2>مبدأ رضا العميل</h2>
          <p>نحرص على أن يصلك منتج فحم النخلة بأعلى جودة. إن لم يكن الطلب مطابقًا للمواصفات، يحق لك طلب الاستبدال أو الاسترجاع وفق الشروط أدناه.</p>

          <h2>المدة المسموح بها</h2>
          <ul>
            <li><strong>14 يومًا</strong> من تاريخ استلام الطلب لتقديم طلب الاسترجاع.</li>
            <li>يجب الإبلاغ عن أي تلف بالشحنة خلال <strong>48 ساعة</strong> من الاستلام مع صور توضيحية.</li>
          </ul>

          <h2>الحالات المقبولة</h2>
          <ul>
            <li>وصول منتج تالف أو مبلل نتيجة الشحن.</li>
            <li>اختلاف الوزن الفعلي عن الوزن المُعلن بأكثر من 3%.</li>
            <li>إرسال منتج مختلف عن المطلوب.</li>
          </ul>

          <h2>الحالات غير المقبولة</h2>
          <ul>
            <li>فتح العبوة واستخدام جزء من المنتج ثم عدم الرضا عن رائحة الاحتراق (طبيعة الفحم تختلف بحسب الاستخدام).</li>
            <li>تلف ناتج عن التخزين في مكان رطب بعد التسليم.</li>
            <li>الطلبات المخصّصة للجملة بعد إصدار الفاتورة الضريبية.</li>
          </ul>

          <h2>خطوات الاسترجاع</h2>
          <ol>
            <li>تواصل معنا عبر البريد <a href="mailto:nakhlacoal@gmail.com">nakhlacoal@gmail.com</a> أو واتساب <a href="https://wa.me/966540060085">+966 54 006 0085</a>.</li>
            <li>أرفق رقم الفاتورة وصور المنتج.</li>
            <li>يتم تنسيق الاستلام العكسي أو زيارة مندوبنا.</li>
            <li>بعد الفحص، يُعاد المبلغ إلى وسيلة الدفع الأصلية خلال <strong>7 أيام عمل</strong>.</li>
          </ol>

          <h2>رسوم</h2>
          <p>الاسترجاع بسبب خطأ منّا: مجاني. الاسترجاع بسبب تغيّر رأي العميل: يتحمّل العميل رسوم الشحن العكسي.</p>
        </>
      ) : (
        <>
          <h2>Our promise</h2>
          <p>We want every Palm Charcoal order to arrive in perfect condition. If it doesn't, you can request a return or exchange under the terms below.</p>

          <h2>Timeframe</h2>
          <ul>
            <li><strong>14 days</strong> from delivery to open a return request.</li>
            <li>Shipping damage must be reported within <strong>48 hours</strong> with photos.</li>
          </ul>

          <h2>Accepted cases</h2>
          <ul>
            <li>Product damaged or soaked during shipping.</li>
            <li>Actual weight differs from stated weight by more than 3%.</li>
            <li>Wrong product delivered.</li>
          </ul>

          <h2>Not accepted</h2>
          <ul>
            <li>Package opened and partially used before dissatisfaction (charcoal burn characteristics vary by use).</li>
            <li>Damage from post-delivery storage in a damp environment.</li>
            <li>Custom wholesale orders after the tax invoice is issued.</li>
          </ul>

          <h2>How to return</h2>
          <ol>
            <li>Contact <a href="mailto:nakhlacoal@gmail.com">nakhlacoal@gmail.com</a> or WhatsApp <a href="https://wa.me/966540060085">+966 54 006 0085</a>.</li>
            <li>Include your invoice number and product photos.</li>
            <li>We arrange reverse pickup.</li>
            <li>After inspection, refunds return to the original payment method within <strong>7 business days</strong>.</li>
          </ol>

          <h2>Fees</h2>
          <p>Return caused by our error: free. Return due to customer change of mind: return shipping is at customer expense.</p>
        </>
      )}
    </LegalPage>
  );
}
