import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import type { Trademark } from '@/data/trademarks';
import { Loader2, Save } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trademark: Trademark;
  isAr: boolean;
}

/**
 * Admin-only quick edit for a single trademark row.
 * Persists to `public.trademarks`; realtime subscription in useTrademarks
 * refreshes the showcase automatically.
 */
export function QuickEditTrademarkDialog({ open, onOpenChange, trademark, isAr }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name_ar: '',
    name_en: '',
    registration_no: '',
    nice_class: '',
    goods_ar: '',
    description_ar: '',
    owner_ar: '',
    expires_hijri: '',
    image_url: '',
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name_ar: trademark.nameAr,
      name_en: trademark.nameEn,
      registration_no: trademark.registrationNo,
      nice_class: trademark.niceClass,
      goods_ar: trademark.goodsAr,
      description_ar: trademark.descriptionAr,
      owner_ar: trademark.ownerAr,
      expires_hijri: trademark.expiresHijri,
      image_url: /^https?:\/\//.test(trademark.image) ? trademark.image : '',
    });
  }, [open, trademark]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('trademarks')
      .update({
        name_ar: form.name_ar,
        name_en: form.name_en,
        registration_no: form.registration_no,
        nice_class: form.nice_class,
        goods_ar: form.goods_ar,
        description_ar: form.description_ar,
        owner_ar: form.owner_ar,
        expires_hijri: form.expires_hijri,
        image_url: form.image_url || null,
      })
      .eq('id', trademark.id);
    setSaving(false);
    if (error) {
      toast({ title: isAr ? 'تعذّر الحفظ' : 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: isAr ? 'تم الحفظ' : 'Saved', description: isAr ? 'تحديث العلامة مباشرة.' : 'Trademark updated.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={isAr ? 'rtl' : 'ltr'} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isAr ? 'تعديل سريع للعلامة التجارية' : 'Quick edit trademark'}</DialogTitle>
          <DialogDescription>
            {isAr ? 'التغييرات تُحفظ مباشرة وتظهر في الموقع فوراً.' : 'Changes save immediately and sync live to the site.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={isAr ? 'الاسم بالعربية' : 'Arabic name'}>
            <Input value={form.name_ar} onChange={set('name_ar')} />
          </Field>
          <Field label={isAr ? 'Name (EN)' : 'Name (EN)'}>
            <Input value={form.name_en} onChange={set('name_en')} />
          </Field>
          <Field label={isAr ? 'رقم التسجيل' : 'Registration No.'}>
            <Input value={form.registration_no} onChange={set('registration_no')} />
          </Field>
          <Field label={isAr ? 'الفئة' : 'Nice class'}>
            <Input value={form.nice_class} onChange={set('nice_class')} />
          </Field>
          <Field label={isAr ? 'ينتهي (هجري)' : 'Expires (Hijri)'}>
            <Input value={form.expires_hijri} onChange={set('expires_hijri')} />
          </Field>
          <Field label={isAr ? 'المالك' : 'Owner'}>
            <Input value={form.owner_ar} onChange={set('owner_ar')} />
          </Field>
          <Field label={isAr ? 'النشاط' : 'Activity'} className="md:col-span-2">
            <Input value={form.goods_ar} onChange={set('goods_ar')} />
          </Field>
          <Field label={isAr ? 'الملاحظات / الوصف' : 'Description'} className="md:col-span-2">
            <Textarea rows={3} value={form.description_ar} onChange={set('description_ar')} />
          </Field>
          <Field
            label={isAr ? 'رابط الشعار (URL)' : 'Logo image URL'}
            hint={isAr ? 'اترك الحقل فارغاً لاستخدام الشعار الافتراضي.' : 'Leave empty to use the bundled default logo.'}
            className="md:col-span-2"
          >
            <Input placeholder="https://…/logo.png" value={form.image_url} onChange={set('image_url')} />
            {form.image_url && (
              <img
                src={form.image_url}
                alt=""
                className="mt-2 max-h-24 object-contain rounded border border-border p-2 bg-background"
                onError={(e) => ((e.currentTarget.style.display = 'none'))}
              />
            )}
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ms-2">{isAr ? 'حفظ التغييرات' : 'Save changes'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  className = '',
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-semibold text-foreground/80">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
