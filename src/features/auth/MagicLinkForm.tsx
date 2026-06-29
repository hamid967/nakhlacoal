import { useState, FormEvent } from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { emailSchema } from './schemas';

interface Props { isAr: boolean }

export function MagicLinkForm({ isAr }: Props) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { setErr(t('بريد إلكتروني غير صالح', 'Invalid email')); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setSent(true);
      toast.success(t('تم إرسال الرابط السحري', 'Magic link sent'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setErr(msg);
      toast.error(t('تعذّر الإرسال', 'Send failed'), { description: msg });
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle2 className="size-10 mx-auto text-primary" aria-hidden="true" />
        <h3 className="font-serif text-xl text-foreground">{t('تحقق من بريدك', 'Check your inbox')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('أرسلنا رابط دخول إلى', 'We sent a sign-in link to')}{' '}
          <span className="text-foreground font-medium">{email}</span>
        </p>
        <button onClick={() => setSent(false)} className="text-sm text-primary hover:underline">
          {t('استخدام بريد آخر', 'Use a different email')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <label htmlFor="magic-email" className="block text-sm text-foreground/80 mb-1.5">
        {t('البريد الإلكتروني', 'Email')}
      </label>
      <div className="relative">
        <Mail className="size-4 absolute inset-y-0 start-3 my-auto text-muted-foreground" aria-hidden="true" />
        <input
          id="magic-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 rounded-xl bg-background/60 backdrop-blur border border-border text-foreground ps-10 pe-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-destructive">{err}</div>
      <button
        type="submit"
        disabled={busy}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {t('أرسل رابط الدخول', 'Send magic link')}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        {t('بدون كلمة مرور — رابط مؤقت ينتهي خلال 60 دقيقة.', 'Passwordless — link expires in 60 minutes.')}
      </p>
    </form>
  );
}
