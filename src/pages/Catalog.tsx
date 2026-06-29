import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { products } from '@/data/products';
import { INVENTORY } from '@/data/inventory';
import { brand } from '@/lib/brand';
import logo from '@/assets/palm-charcoal-logo.png';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

/**
 * Print-optimized bilingual product catalog.
 * Use the browser "Save as PDF" via window.print() — perfectly preserves
 * Arabic typography, RTL, and brand fonts without any PDF font hassles.
 */
export default function Catalog() {
  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  useEffect(() => {
    document.title = isAr
      ? 'كتالوج فحم النخلة — Palm Charcoal Catalog'
      : 'Palm Charcoal — Product Catalog';
  }, [isAr]);

  const priceFor = (slug: string) => {
    const inv = INVENTORY.find((i) => i.match.test(slug) || i.match.test(products.find((p) => p.slug === slug)?.nameAr || ''));
    if (!inv) return null;
    return inv.tiers;
  };

  const handlePrint = () => window.print();

  return (
    <div dir={dir} className="catalog-root bg-white text-stone-900 min-h-dvh">
      {/* Action bar (hidden on print) */}
      <div className="no-print sticky top-0 z-50 bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          {isAr
            ? 'اضغط "تحميل PDF" ثم اختر "حفظ كملف PDF" من نافذة الطباعة.'
            : 'Click "Download PDF" and choose "Save as PDF" in the print dialog.'}
        </p>
        <Button onClick={handlePrint} className="bg-emerald-800 hover:bg-emerald-900 text-white">
          <Download className="w-4 h-4 mr-2" />
          {isAr ? 'تحميل PDF' : 'Download PDF'}
        </Button>
      </div>

      <div className="catalog-page mx-auto max-w-[860px] px-10 py-12">
        {/* Cover */}
        <section className="catalog-cover text-center pb-12 border-b-2 border-emerald-800">
          <img src={logo} alt="Palm Charcoal" className="w-32 h-32 mx-auto mb-6 object-contain" />
          <h1 className="text-5xl font-bold text-emerald-900 mb-2">
            {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
          </h1>
          <p className="text-2xl text-stone-600 mb-1">
            {isAr ? 'Palm Charcoal' : 'فحم النخلة'}
          </p>
          <p className="text-lg text-amber-700 mt-6 tracking-wide uppercase">
            {isAr ? 'كتالوج المنتجات الرسمي' : 'Official Product Catalog'}
          </p>
          <p className="text-sm text-stone-500 mt-4">
            {new Date().getFullYear()} · {isAr ? 'جدة، المملكة العربية السعودية' : 'Jeddah, Kingdom of Saudi Arabia'}
          </p>
        </section>

        {/* Intro */}
        <section className="py-10 page-break">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4 border-l-4 border-amber-600 pl-3">
            {isAr ? 'عن العلامة' : 'About the Brand'}
          </h2>
          <p className="text-stone-700 leading-relaxed">
            {isAr
              ? 'منذ ٢٠١٠ ونحن نُقدّم فحماً طبيعياً فاخراً من قلب جدة البلد، نخدم المطاعم والفنادق ومحبي الشواء وأسواق التصدير العالمية بمعايير جودة معتمدة.'
              : 'Since 2010, Palm Charcoal has crafted premium natural charcoal from the heart of Jeddah Al-Balad, serving restaurants, hotels, BBQ enthusiasts, and global export markets to certified quality standards.'}
          </p>
        </section>

        {/* Products */}
        {products.map((p, idx) => {
          const tiers = priceFor(p.slug);
          return (
            <article key={p.slug} className="product-card page-break py-8 border-t border-stone-200">
              <div className="flex items-start gap-2 mb-4">
                <span className="text-sm text-amber-700 font-mono">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-emerald-900">
                    {isAr ? p.nameAr : p.nameEn}
                  </h3>
                  <p className="text-stone-500 text-sm">
                    {isAr ? p.nameEn : p.nameAr}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <img
                  src={p.image}
                  alt={p.nameEn}
                  className="w-full h-48 object-cover rounded border border-stone-200"
                />
                <div>
                  <p className="text-stone-700 text-sm leading-relaxed mb-3">
                    {isAr ? p.descAr : p.descEn}
                  </p>
                  <ul className="text-xs text-stone-600 space-y-1">
                    {(isAr ? p.featuresAr : p.featuresEn).map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {Object.entries(p.specs).map(([k, v]) => (
                  <div key={k} className="bg-stone-50 border border-stone-200 px-2 py-1.5 rounded">
                    <div className="text-stone-500 uppercase text-[10px]">{k}</div>
                    <div className="font-semibold text-stone-800">{v}</div>
                  </div>
                ))}
              </div>

              {tiers && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-2">
                    {isAr ? 'أسعار الجملة (ريال/كجم)' : 'Wholesale Pricing (SAR/kg)'}
                  </h4>
                  <table className="w-full text-xs border border-stone-200">
                    <thead className="bg-emerald-900 text-white">
                      <tr>
                        <th className="p-2 text-start">{isAr ? 'الكمية (كجم)' : 'Quantity (kg)'}</th>
                        <th className="p-2 text-end">{isAr ? 'السعر/كجم' : 'Price/kg'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((tier) => (
                        <tr key={tier.minKg} className="border-t border-stone-200">
                          <td className="p-2">{tier.minKg === 0 ? (isAr ? 'أقل من 50' : 'Under 50') : `≥ ${tier.minKg}`}</td>
                          <td className="p-2 text-end font-mono">{tier.pricePerKg} SAR</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })}

        {/* Contact footer */}
        <section className="mt-12 pt-8 border-t-2 border-emerald-800 text-center">
          <h2 className="text-xl font-bold text-emerald-900 mb-3">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
          </h2>
          <p className="text-stone-700">WhatsApp: +966 54 006 0095</p>
          <p className="text-stone-700">Email: mab355@gmail.com</p>
          <p className="text-stone-700">Web: alnakhlacoal.com</p>
          <p className="text-xs text-stone-400 mt-6">
            © {new Date().getFullYear()} Palm Charcoal · {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </section>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .catalog-root { background: white !important; }
          .page-break { page-break-inside: avoid; }
          .product-card { break-inside: avoid; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>
    </div>
  );
}
