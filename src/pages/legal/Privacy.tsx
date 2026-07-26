import { useTranslation } from 'react-i18next';
import { LegalPage } from '@/components/legal/LegalPage';

export default function Privacy() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <LegalPage
      slug="privacy"
      titleAr="سياسة الخصوصية"
      titleEn="Privacy Policy"
      descAr="سياسة خصوصية فحم النخلة توضح كيفية جمع بياناتك واستخدامها وحمايتها وفقًا لنظام حماية البيانات الشخصية السعودي (PDPL)."
      descEn="Palm Charcoal's privacy policy explains how we collect, use, and protect your personal data in line with Saudi PDPL."
      updatedAt="2026-07-26"
    >
      {isAr ? (
        <>
          <h2>مقدمة</h2>
          <p>تحترم <strong>فحم النخلة</strong> (ومقرها جدة، المملكة العربية السعودية) خصوصية زوّار وعملاء موقعنا الإلكتروني. توضّح هذه السياسة نوع البيانات التي نجمعها وأسباب جمعها وكيفية معالجتها وحمايتها بما يتوافق مع نظام حماية البيانات الشخصية السعودي (PDPL).</p>

          <h2>البيانات التي نجمعها</h2>
          <ul>
            <li><strong>بيانات هوية وتواصل:</strong> الاسم، رقم الجوال، البريد الإلكتروني، اسم المنشأة، السجل التجاري، عنوان الشحن.</li>
            <li><strong>بيانات الطلب:</strong> المنتجات والكميات وطريقة الدفع وسجل المعاملات والفواتير الضريبية.</li>
            <li><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح، صفحات الزيارة، بيانات الأداء لتحسين الموقع.</li>
          </ul>

          <h2>أغراض المعالجة</h2>
          <ul>
            <li>تنفيذ الطلبات وإصدار الفواتير الضريبية المعتمدة من هيئة الزكاة والضريبة والجمارك.</li>
            <li>التواصل معك بخصوص الطلبات والشحنات وخدمة العملاء.</li>
            <li>تحسين تجربة الموقع وتحليل الأداء (بشكل مجمّع وغير معرّف).</li>
            <li>الامتثال للالتزامات النظامية والمحاسبية في المملكة العربية السعودية.</li>
          </ul>

          <h2>مشاركة البيانات</h2>
          <p>لا نبيع بياناتك. نتشارك القدر الأدنى الضروري مع مزوّدي خدمة موثوقين فقط:</p>
          <ul>
            <li>شركات الشحن لتوصيل طلبك.</li>
            <li>مزوّد استضافة الموقع وقاعدة البيانات.</li>
            <li>مزوّد إرسال البريد الإلكتروني (Resend) لإشعارات الطلبات.</li>
            <li>الجهات الحكومية عند الطلب النظامي فقط.</li>
          </ul>

          <h2>حقوقك (وفق PDPL)</h2>
          <ul>
            <li>الوصول إلى بياناتك وطلب نسخة منها.</li>
            <li>تصحيح البيانات غير الدقيقة.</li>
            <li>طلب حذف بياناتك عند انتفاء الحاجة النظامية.</li>
            <li>سحب موافقتك على التسويق في أي وقت.</li>
          </ul>

          <h2>الاحتفاظ بالبيانات</h2>
          <p>نحتفظ بسجلات الطلبات والفواتير لمدة <strong>10 سنوات</strong> امتثالًا لمتطلبات هيئة الزكاة والضريبة والجمارك. تُحذف بيانات التصفح غير المرتبطة بحساب خلال 12 شهرًا.</p>

          <h2>ملفات الارتباط (Cookies)</h2>
          <p>نستخدم ملفات ارتباط ضرورية لتشغيل السلة وتذكّر تفضيل اللغة. لا نستخدم إعلانات طرف ثالث.</p>

          <h2>التواصل معنا</h2>
          <p>لأي استفسار عن الخصوصية: <a href="mailto:nakhlacoal@gmail.com">nakhlacoal@gmail.com</a> — واتساب: <a href="https://wa.me/966540060085">+966 54 006 0085</a>.</p>
        </>
      ) : (
        <>
          <h2>Introduction</h2>
          <p><strong>Palm Charcoal</strong>, based in Jeddah, Saudi Arabia, respects the privacy of visitors and customers. This policy explains what personal data we collect, why we collect it, and how we protect it in line with the Saudi Personal Data Protection Law (PDPL).</p>

          <h2>Data we collect</h2>
          <ul>
            <li><strong>Identity &amp; contact:</strong> name, phone, email, company, commercial registration, shipping address.</li>
            <li><strong>Order data:</strong> products, quantities, payment method, transaction history, tax invoices.</li>
            <li><strong>Technical data:</strong> IP address, browser, page visits, performance telemetry.</li>
          </ul>

          <h2>Purposes of processing</h2>
          <ul>
            <li>Fulfilling orders and issuing ZATCA-compliant tax invoices.</li>
            <li>Communicating about orders, shipments, and customer support.</li>
            <li>Improving site experience and aggregate analytics.</li>
            <li>Complying with Saudi regulatory and accounting obligations.</li>
          </ul>

          <h2>Sharing</h2>
          <p>We never sell your data. We share only what is necessary with trusted processors: shipping carriers, our hosting/database provider, our email provider (Resend), and government authorities when legally required.</p>

          <h2>Your rights (under PDPL)</h2>
          <ul>
            <li>Access your data and request a copy.</li>
            <li>Correct inaccurate information.</li>
            <li>Request deletion when no longer legally required.</li>
            <li>Withdraw marketing consent at any time.</li>
          </ul>

          <h2>Retention</h2>
          <p>Order and invoice records are retained for <strong>10 years</strong> to comply with ZATCA requirements. Non-account browsing data is deleted within 12 months.</p>

          <h2>Cookies</h2>
          <p>We use essential cookies for cart and language preference only. We do not run third-party ad networks.</p>

          <h2>Contact</h2>
          <p>Privacy inquiries: <a href="mailto:nakhlacoal@gmail.com">nakhlacoal@gmail.com</a> — WhatsApp: <a href="https://wa.me/966540060085">+966 54 006 0085</a>.</p>
        </>
      )}
    </LegalPage>
  );
}
