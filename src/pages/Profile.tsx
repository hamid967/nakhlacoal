import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SeoHead } from '@/components/SeoHead';
import { Loader2, Upload } from 'lucide-react';
import { useParallax } from '@/hooks/useParallax';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'الاسم قصير جدًا').max(80),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,20}$/, 'رقم جوال غير صالح').or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  preferred_language: z.enum(['ar', 'en']),
});

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  useParallax();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    company: '',
    avatar_url: '',
    preferred_language: 'ar' as 'ar' | 'en',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, company, avatar_url, preferred_language')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setForm({
          full_name: data.full_name ?? '',
          phone: data.phone ?? '',
          company: data.company ?? '',
          avatar_url: data.avatar_url ?? '',
          preferred_language: (data.preferred_language as 'ar' | 'en') ?? 'ar',
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2_000_000) {
      toast.error(isAr ? 'الحد الأقصى 2MB' : 'Max 2MB');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, avatar_url: reader.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        company: form.company,
        avatar_url: form.avatar_url,
        preferred_language: form.preferred_language,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isAr ? 'تم حفظ التغييرات' : 'Saved');
      if (form.preferred_language !== i18n.language) i18n.changeLanguage(form.preferred_language);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SeoHead title={isAr ? 'الملف الشخصي' : 'Profile'} noindex />
      <div className="container max-w-2xl py-24">
        <h1 className="font-serif text-4xl mb-2">{isAr ? 'الملف الشخصي' : 'Profile'}</h1>
        <p className="text-muted-foreground mb-8">{isAr ? 'إدارة معلوماتك الشخصية' : 'Manage your account'}</p>

        <div className="glass-luxe rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
              ) : (
                <span className="text-2xl text-muted-foreground">?</span>
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Upload className="w-4 h-4" />
              {isAr ? 'تغيير الصورة' : 'Change photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
            </label>
          </div>

          <div>
            <Label htmlFor="full_name">{isAr ? 'الاسم الكامل' : 'Full name'}</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={80} />
            {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <Label htmlFor="phone">{isAr ? 'رقم الجوال' : 'Phone'}</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+9665XXXXXXXX" />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="company">{isAr ? 'الشركة' : 'Company'}</Label>
            <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={120} />
            {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
          </div>

          <div>
            <Label htmlFor="lang">{isAr ? 'اللغة المفضلة' : 'Preferred language'}</Label>
            <select
              id="lang"
              value={form.preferred_language}
              onChange={(e) => setForm({ ...form, preferred_language: e.target.value as 'ar' | 'en' })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <Label>{isAr ? 'البريد الإلكتروني' : 'Email'}</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isAr ? 'حفظ التغييرات' : 'Save changes'}
          </Button>
        </div>
      </div>
    </>
  );
}
