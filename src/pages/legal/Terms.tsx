import { useTranslation } from 'react-i18next';
import { LegalPage } from '@/components/legal/LegalPage';

export default function Terms() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <LegalPage
      slug="terms"
      titleAr="الشروط والأحكام"
      titleEn="Terms & Conditions"
      descAr="شروط استخدام موقع فحم النخلة وشروط البيع للمنتجات في المملكة العربية السعودية."
      descEn="Palm Charcoal website terms of use and product sale conditions in Saudi Arabia."
      updatedAt="2026-07-26"
    >
      {isAr ? (
        <>
          <h2>1. القبول</h2>
          <p>باستخدامك موقع <strong>فحم النخلة</strong> أو بإتمام أي طلب شراء، فإنك توافق على هذه الشروط والأحكام. إن لم توافق، يرجى عدم استخدام الموقع.</p>

          <h2>2. المنتجات والأسعار</h2>
          <ul>
            <li>جميع الأسعار بالريال السعودي (SAR) وتشمل ضريبة القيمة المضافة 15% ما لم يُذكر خلاف ذلك.</li>
            <li>نحتفظ بحق تعديل الأسعار والمواصفات في أي وقت. السعر المعتمد هو ما يُحسب لحظة تأكيد الطلب من الخادم.</li>
            <li>الصور توضيحية وقد تختلف بشكل بسيط عن المنتج المُسلَّم.</li>
          </ul>

          <h2>3. الطلبات والدفع</h2>
          <ul>
            <li>يُعدّ الطلب مؤكدًا عند إصدار الفاتورة الضريبية.</li>
            <li>نقبل التحويل البنكي والدفع عند الاستلام (داخل المدن المحددة).</li>
            <li>يحق لنا رفض أو إلغاء أي طلب في حال الاشتباه بالاحتيال أو نفاد المخزون.</li>
          </ul>

          <h2>4. الشحن والتسليم</h2>
          <p>يرجى مراجعة <a href="/shipping-policy">سياسة الشحن</a> لتفاصيل مدد التسليم والرسوم والمناطق المخدومة.</p>

          <h2>5. الاسترجاع</h2>
          <p>يرجى مراجعة <a href="/refund-policy">سياسة الاسترجاع</a>.</p>

          <h2>6. الاستخدام العادل</h2>
          <ul>
            <li>يُمنع أي استخدام آلي (bots/scraping) دون إذن كتابي مسبق.</li>
            <li>يُمنع محاولة اختراق النظام أو التلاعب بالأسعار أو الفواتير.</li>
          </ul>

          <h2>7. الملكية الفكرية</h2>
          <p>جميع العلامات التجارية والشعارات والمحتوى مملوكة لشركة فحم النخلة. يُمنع النسخ التجاري دون إذن.</p>

          <h2>8. حدود المسؤولية</h2>
          <p>لا نتحمل مسؤولية الأضرار غير المباشرة (فقدان الأرباح، الأعمال المتوقفة) الناتجة عن استخدام المنتج بشكل غير آمن أو خلاف التعليمات.</p>

          <h2>9. القانون الحاكم</h2>
          <p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية، ومحاكم جدة هي المختصة بالنظر في أي نزاع.</p>

          <h2>10. التعديلات</h2>
          <p>قد نحدّث هذه الشروط دوريًا. يستمر استخدامك للموقع بعد التحديث يعني قبولك للنسخة الجديدة.</p>
        </>
      ) : (
        <>
          <h2>1. Acceptance</h2>
          <p>By using the <strong>Palm Charcoal</strong> website or placing an order, you agree to these Terms &amp; Conditions. If you do not agree, please do not use the site.</p>

          <h2>2. Products &amp; pricing</h2>
          <ul>
            <li>Prices are in Saudi Riyal (SAR) and include 15% VAT unless stated otherwise.</li>
            <li>We reserve the right to change prices and specs at any time. The binding price is the one computed by our server at order confirmation.</li>
            <li>Images are illustrative; the shipped product may differ slightly.</li>
          </ul>

          <h2>3. Orders &amp; payment</h2>
          <ul>
            <li>An order is confirmed once the tax invoice is issued.</li>
            <li>We accept bank transfer and cash on delivery (in selected cities).</li>
            <li>We may refuse or cancel any order in case of suspected fraud or stock-out.</li>
          </ul>

          <h2>4. Shipping</h2>
          <p>See our <a href="/shipping-policy">Shipping Policy</a> for lead times, fees, and served regions.</p>

          <h2>5. Refunds</h2>
          <p>See our <a href="/refund-policy">Refund Policy</a>.</p>

          <h2>6. Fair use</h2>
          <ul>
            <li>Automated scraping is prohibited without prior written consent.</li>
            <li>Attempts to breach security or tamper with prices or invoices are prohibited.</li>
          </ul>

          <h2>7. Intellectual property</h2>
          <p>All trademarks, logos, and content are owned by Palm Charcoal. Commercial reuse requires written permission.</p>

          <h2>8. Liability</h2>
          <p>We are not liable for indirect damages (lost profits, business interruption) resulting from misuse of the product or use contrary to instructions.</p>

          <h2>9. Governing law</h2>
          <p>These terms are governed by the laws of Saudi Arabia. The competent courts of Jeddah shall resolve any dispute.</p>

          <h2>10. Changes</h2>
          <p>We may update these terms. Continued use after an update constitutes acceptance.</p>
        </>
      )}
    </LegalPage>
  );
}
