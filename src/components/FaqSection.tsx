import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ScrollReveal } from '@/components/ScrollReveal';
import { LuxSection, SectionHeader } from '@/components/ui-lux';

export function FaqSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [open, setOpen] = useState<number | null>(0);

  const items = isAr
    ? [
        { q: 'ما الذي يميز فحم النخلة عن غيره؟', a: 'فحم طبيعي ١٠٠٪ من أجود الأخشاب، حرارة ثابتة تصل إلى 750°م، احتراق يدوم حتى 90 دقيقة، ورماد لا يتجاوز 3٪.' },
        { q: 'هل المنتج مناسب للمطاعم والاستخدام التجاري؟', a: 'نعم، نوفّر عبوات جملة وعقود توريد دورية للمطاعم والفنادق ومحلات المعسل في جميع مناطق المملكة.' },
        { q: 'هل تقدمون خدمة التصدير خارج المملكة؟', a: 'نعم، نصدّر إلى دول الخليج وأوروبا وآسيا مع توثيق كامل لشهادات الجودة والمنشأ.' },
        { q: 'كيف يمكنني الطلب أو طلب عرض سعر؟', a: 'يمكنك التواصل معنا عبر زر واتساب أو نموذج الطلب أدناه، وفريقنا يرد خلال ساعات العمل.' },
      ]
    : [
        { q: 'What makes Palm Charcoal different?', a: '100% natural hardwood, consistent heat up to 750°C, burn time up to 90 minutes, with under 3% ash residue.' },
        { q: 'Is it suitable for restaurants and commercial use?', a: 'Yes — we offer wholesale packs and recurring supply contracts for restaurants, hotels, and hookah lounges across the Kingdom.' },
        { q: 'Do you export internationally?', a: 'Yes, we export to the GCC, Europe, and Asia with full quality and origin documentation.' },
        { q: 'How can I place an order or request a quote?', a: 'Reach us via WhatsApp or the order form — our team responds within business hours.' },
      ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };

  return (
    <LuxSection id="faq" className="section">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <SectionHeader
        eyebrow={isAr ? 'الأسئلة الشائعة' : 'FAQ'}
        title={isAr ? 'إجابات لأكثر ما يسألنا عنه عملاؤنا' : 'Answers to what customers ask most'}
      />
      <div className="max-w-3xl mx-auto">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <ScrollReveal key={i} delay={i * 60}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-start border-t border-foreground/10 py-5 sm:py-6 flex items-start gap-4 group"
                aria-expanded={isOpen}
              >
                <span className={`mt-1 shrink-0 w-8 h-8 rounded-full border border-foreground/15 flex items-center justify-center transition-all ${isOpen ? 'bg-jade text-background border-jade rotate-45' : 'text-jade group-hover:border-jade/50'}`}>
                  <Plus className="w-4 h-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-base sm:text-lg font-semibold font-arabic text-dark">{it.q}</span>
                  <span
                    className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <span className="overflow-hidden">
                      <span className="block text-sm sm:text-base font-arabic text-foreground/70 leading-relaxed pe-2">{it.a}</span>
                    </span>
                  </span>
                </span>
              </button>
            </ScrollReveal>
          );
        })}
        <div className="border-t border-foreground/10" />
      </div>
    </LuxSection>
  );
}
