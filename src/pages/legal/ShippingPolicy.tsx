import { useTranslation } from 'react-i18next';
import { LegalPage } from '@/components/legal/LegalPage';

export default function ShippingPolicy() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <LegalPage
      slug="shipping-policy"
      titleAr="سياسة الشحن"
      titleEn="Shipping Policy"
      descAr="مدد وأسعار وشروط شحن منتجات فحم النخلة داخل المملكة العربية السعودية والتصدير."
      descEn="Palm Charcoal shipping lead times, fees, and export terms across Saudi Arabia and abroad."
      updatedAt="2026-07-26"
    >
      {isAr ? (
        <>
          <h2>المناطق المخدومة</h2>
          <ul>
            <li><strong>جدة ومكة:</strong> توصيل يومي، خلال 24 ساعة عمل.</li>
            <li><strong>الرياض والمنطقة الشرقية:</strong> 2-3 أيام عمل.</li>
            <li><strong>باقي مدن المملكة:</strong> 3-5 أيام عمل.</li>
            <li><strong>التصدير:</strong> بحسب الوجهة، يتم الاتفاق على INCOTERMS في العرض.</li>
          </ul>

          <h2>الرسوم</h2>
          <ul>
            <li>الطلبات أقل من 20 كجم: تحسب حسب الوزن والمنطقة.</li>
            <li>الطلبات فوق 500 ر.س داخل جدة: <strong>شحن مجاني</strong>.</li>
            <li>طلبات الجملة (بالطن): يتم الاتفاق على وسيلة النقل (مقطورة/حاوية) ضمن عرض السعر.</li>
          </ul>

          <h2>التغليف</h2>
          <p>نستخدم أكياس مقاومة للرطوبة وصناديق كرتون قوية لطلبات التجزئة، وأكياس PP صناعية لطلبات الجملة، مع علامة القاعدة على كل عبوة.</p>

          <h2>التتبع</h2>
          <p>يُرسَل رقم التتبع عبر رسالة نصية وبريد إلكتروني فور شحن الطلب. يمكنك أيضًا متابعة الحالة من صفحة <a href="/orders">طلباتي</a>.</p>

          <h2>محاولات التسليم</h2>
          <p>نقوم بثلاث محاولات تسليم. إذا تعذّر التواصل مع المستلم يُعاد الطلب إلى المستودع ويتحمّل العميل رسوم إعادة الإرسال.</p>

          <h2>التصدير</h2>
          <p>نوفّر شهادات المنشأ وشهادات الجودة (SASO/ISO حيثما تنطبق). الرسوم الجمركية في بلد الوصول على المستورد ما لم يُتفق على DDP.</p>
        </>
      ) : (
        <>
          <h2>Serviced regions</h2>
          <ul>
            <li><strong>Jeddah &amp; Mecca:</strong> daily delivery, within 24 business hours.</li>
            <li><strong>Riyadh &amp; Eastern Province:</strong> 2–3 business days.</li>
            <li><strong>Other Saudi cities:</strong> 3–5 business days.</li>
            <li><strong>Export:</strong> depends on destination; INCOTERMS agreed in the quote.</li>
          </ul>

          <h2>Fees</h2>
          <ul>
            <li>Orders under 20 kg: calculated by weight and region.</li>
            <li>Orders above SAR 500 within Jeddah: <strong>free shipping</strong>.</li>
            <li>Wholesale (per ton): freight method (trailer/container) agreed in the quote.</li>
          </ul>

          <h2>Packaging</h2>
          <p>Moisture-resistant bags with sturdy cartons for retail, and industrial PP bags for wholesale. Every package carries the batch mark.</p>

          <h2>Tracking</h2>
          <p>A tracking number is sent by SMS and email as soon as your order ships. Status is also visible in <a href="/orders">My orders</a>.</p>

          <h2>Delivery attempts</h2>
          <p>We attempt delivery up to three times. If we cannot reach the recipient, the parcel returns to our warehouse and the customer covers redelivery costs.</p>

          <h2>Export</h2>
          <p>Certificates of Origin and quality certificates (SASO/ISO where applicable) are provided. Destination-country duties are the importer's responsibility unless DDP is agreed.</p>
        </>
      )}
    </LegalPage>
  );
}
