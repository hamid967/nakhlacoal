import { useState, useEffect, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/features/auth/schemas';

export default function ResetPassword() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Wait for Supabase to consume the recovery hash and establish a session.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) { setErr(t('كلمة المرور قصيرة جدًا', 'Password is too short')); return; }
    if (password !== confirm) { setErr(t('كلمتا المرور غير متطابقتين', 'Passwords do not match')); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data });
      if (error) throw error;
      toast.success(t('تم تحديث كلمة المرور', 'Password updated'));
      navigate('/auth', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'unknown');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('استعادة كلمة المرور | فحم النخلة', 'Reset Password | Palm Charcoal')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="min-h-[calc(100dvh-4rem)] grid place-items-center px-4 py-16" dir={isAr ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl p-8"
        >
          <h1 className="font-serif text-2xl text-foreground text-center">
            {t('تعيين كلمة مرور جديدة', 'Set a new password')}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1 mb-6">
            {t('اختر كلمة مرور قوية لا تقل عن 8 أحرف.', 'Choose a strong password (min 8 characters).')}
          </p>

          {!ready ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-6">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t('جارٍ التحقّق من الرابط…', 'Verifying recovery link…')}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <PasswordField id="pw" label={t('كلمة المرور الجديدة', 'New password')} value={password} onChange={setPassword} autoComplete="new-password" />
              <PasswordField id="pw2" label={t('تأكيد كلمة المرور', 'Confirm password')} value={confirm} onChange={setConfirm} autoComplete="new-password" />
              <div aria-live="polite" className="min-h-[1.25rem] text-sm text-destructive">{err}</div>
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t('تحديث كلمة المرور', 'Update password')}
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-foreground/80 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="size-4 absolute inset-y-0 start-3 my-auto text-muted-foreground" aria-hidden="true" />
        <input
          id={id}
          type="password"
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 rounded-xl bg-background/60 backdrop-blur border border-border text-foreground ps-10 pe-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
