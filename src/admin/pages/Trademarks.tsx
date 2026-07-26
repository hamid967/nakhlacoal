import { useState } from 'react';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTrademarks } from '@/hooks/useTrademarks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { z } from 'zod';

type Row = {
  id: string;
  registration_no: string;
  name_ar: string;
  name_en: string;
  nice_class: string;
  filed_hijri: string | null;
  registered_hijri: string | null;
  expires_hijri: string | null;
  owner_ar: string | null;
  address_ar: string | null;
  country_ar: string | null;
  description_ar: string | null;
  goods_ar: string | null;
  colors: string[];
  sort_order: number;
  is_active: boolean;
};

const empty: Row = {
  id: '', registration_no: '', name_ar: '', name_en: '', nice_class: 'الفئة 4',
  filed_hijri: '', registered_hijri: '', expires_hijri: '',
  owner_ar: '', address_ar: '', country_ar: 'المملكة العربية السعودية',
  description_ar: '', goods_ar: '', colors: [], sort_order: 0, is_active: true,
};

const schema = z.object({
  id: z.string().trim().min(1, 'المعرف مطلوب').max(64).regex(/^[a-z0-9-]+$/, 'حروف صغيرة وأرقام و - فقط'),
  registration_no: z.string().trim().min(1, 'رقم التسجيل مطلوب').max(64),
  name_ar: z.string().trim().min(1).max(120),
  name_en: z.string().trim().min(1).max(120),
  nice_class: z.string().trim().min(1).max(40),
});

export default function AdminTrademarks() {
  const { trademarks } = useTrademarks();
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(empty); setIsNew(true); };
  const openEdit = async (id: string) => {
    const { data, error } = await supabase.from('trademarks').select('*').eq('id', id).maybeSingle();
    if (error || !data) return toast.error('تعذّر تحميل العلامة');
    setEditing(data as Row); setIsNew(false);
  };

  const remove = async (id: string) => {
    if (!confirm('حذف هذه العلامة؟')) return;
    const { error } = await supabase.from('trademarks').delete().eq('id', id);
    if (error) return toast.error('فشل الحذف: ' + error.message);
    toast.success('تم الحذف');
  };

  const save = async () => {
    if (!editing) return;
    const parsed = schema.safeParse(editing);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSaving(true);
    const payload = { ...editing, colors: editing.colors ?? [] };
    const { error } = isNew
      ? await supabase.from('trademarks').insert(payload)
      : await supabase.from('trademarks').update(payload).eq('id', editing.id);
    setSaving(false);
    if (error) return toast.error('فشل الحفظ: ' + error.message);
    toast.success(isNew ? 'تمت الإضافة' : 'تم التحديث');
    setEditing(null);
  };

  const set = <K extends keyof Row>(k: K, v: Row[K]) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div className="p-6 space-y-6">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">الإدارة · العلامات التجارية</p>
          <h1>إدارة العلامات التجارية</h1>
          <p>التحديثات تنعكس مباشرة عبر Realtime.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> علامة جديدة</Button>
      </header>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-foreground/70">
            <tr>
              <th className="text-start p-3">الاسم</th>
              <th className="text-start p-3">رقم التسجيل</th>
              <th className="text-start p-3">الفئة</th>
              <th className="text-start p-3">الترتيب</th>
              <th className="text-start p-3">نشط</th>
              <th className="text-end p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {trademarks.map((t) => (
              <tr key={t.id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="p-3">
                  <div className="font-semibold">{t.nameAr}</div>
                  <div className="text-xs text-foreground/50">{t.nameEn} · {t.id}</div>
                </td>
                <td className="p-3 font-mono text-xs">{t.registrationNo}</td>
                <td className="p-3">{t.niceClass}</td>
                <td className="p-3">—</td>
                <td className="p-3"><span className="inline-block w-2 h-2 rounded-full bg-sand0" /></td>
                <td className="p-3 text-end">
                  <div className="inline-flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(t.id)} className="gap-1">
                      <Pencil className="w-3.5 h-3.5" /> تعديل
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => remove(t.id)} className="gap-1 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {trademarks.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-foreground/50">لا توجد علامات</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'إضافة علامة' : 'تعديل العلامة'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="المعرّف (id)" disabled={!isNew}>
                <Input value={editing.id} onChange={(e) => set('id', e.target.value)} dir="ltr" />
              </Field>
              <Field label="رقم التسجيل">
                <Input value={editing.registration_no} onChange={(e) => set('registration_no', e.target.value)} dir="ltr" />
              </Field>
              <Field label="الاسم بالعربية">
                <Input value={editing.name_ar} onChange={(e) => set('name_ar', e.target.value)} />
              </Field>
              <Field label="الاسم بالإنجليزية">
                <Input value={editing.name_en} onChange={(e) => set('name_en', e.target.value)} dir="ltr" />
              </Field>
              <Field label="الفئة">
                <Input value={editing.nice_class} onChange={(e) => set('nice_class', e.target.value)} />
              </Field>
              <Field label="الترتيب">
                <Input type="number" value={editing.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
              </Field>
              <Field label="تاريخ التقديم (هـ)">
                <Input value={editing.filed_hijri ?? ''} onChange={(e) => set('filed_hijri', e.target.value)} dir="ltr" />
              </Field>
              <Field label="تاريخ التسجيل (هـ)">
                <Input value={editing.registered_hijri ?? ''} onChange={(e) => set('registered_hijri', e.target.value)} dir="ltr" />
              </Field>
              <Field label="تاريخ الانتهاء (هـ)">
                <Input value={editing.expires_hijri ?? ''} onChange={(e) => set('expires_hijri', e.target.value)} dir="ltr" />
              </Field>
              <Field label="المالك">
                <Input value={editing.owner_ar ?? ''} onChange={(e) => set('owner_ar', e.target.value)} />
              </Field>
              <Field label="العنوان" className="md:col-span-2">
                <Input value={editing.address_ar ?? ''} onChange={(e) => set('address_ar', e.target.value)} />
              </Field>
              <Field label="الدولة">
                <Input value={editing.country_ar ?? ''} onChange={(e) => set('country_ar', e.target.value)} />
              </Field>
              <Field label="الألوان (مفصولة بفواصل)">
                <Input
                  value={(editing.colors ?? []).join(',')}
                  onChange={(e) => set('colors', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  dir="ltr"
                  placeholder="#1A4A00,#6B3A2A"
                />
              </Field>
              <Field label="النشاط / السلع" className="md:col-span-2">
                <Textarea value={editing.goods_ar ?? ''} onChange={(e) => set('goods_ar', e.target.value)} rows={2} />
              </Field>
              <Field label="الوصف" className="md:col-span-2">
                <Textarea value={editing.description_ar ?? ''} onChange={(e) => set('description_ar', e.target.value)} rows={3} />
              </Field>
              <div className="flex items-center gap-3 md:col-span-2">
                <Switch checked={editing.is_active} onCheckedChange={(v) => set('is_active', v)} />
                <Label>نشطة</Label>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} className="gap-2"><X className="w-4 h-4" /> إلغاء</Button>
            <Button onClick={save} disabled={saving} className="gap-2"><Save className="w-4 h-4" /> حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, className, disabled }: { label: string; children: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <div className={className}>
      <Label className={`text-xs ${disabled ? 'opacity-60' : ''}`}>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
