import { Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/admin/categories': 'التصنيفات',
  '/admin/brands': 'العلامات التجارية',
  '/admin/wholesale': 'الجملة',
  '/admin/export': 'التصدير',
  '/admin/suppliers': 'الموردون',
  '/admin/warehouse': 'المستودع',
  '/admin/quality': 'مراقبة الجودة',
  '/admin/certificates': 'الشهادات',
  '/admin/invoices': 'الفواتير',
  '/admin/payments': 'المدفوعات',
  '/admin/marketing': 'التسويق',
  '/admin/ai-center': 'مركز الذكاء الاصطناعي',
  '/admin/website': 'محرر الموقع',
  '/admin/seo': 'تحسين محركات البحث',
  '/admin/blog': 'المعرفة والمدونة',
  '/admin/media': 'مكتبة الوسائط',
  '/admin/users': 'المستخدمون',
  '/admin/roles': 'الأدوار والصلاحيات',
  '/admin/logs': 'سجل النظام',
  '/admin/security': 'الأمان',
};

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'قسم';
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="a-card p-12 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, var(--a-palm), var(--a-gold))', color: '#fff' }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="a-display text-3xl mb-2">{title}</div>
        <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>
          هذا القسم ضمن المراحل القادمة من لوحة الإدارة. سيتم تفعيله مع البنية المرتبطة في قاعدة البيانات قريباً.
        </p>
      </div>
    </div>
  );
}
