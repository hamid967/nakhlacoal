import { useState, FormEvent } from 'react';
import { Phone, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { phoneSchema, otpSchema } from './schemas';

interface Props {
  isAr: boolean;
  onSuccess: () => void;
}

export function PhoneOtpForm({ isAr, onSuccess }: Props) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+966');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const requestCode = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setErr(t('رقم غير صالح. مثال: +9665XXXXXXXX', 'Invalid phone. Example: +9665XXXXXXXX'));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data });
      if (error) throw error;
      toast.success(t('أرسلنا رمزًا إلى هاتفك', 'We sent a code to your phone'));
      setStep('otp');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      // Common: SMS provider not configured yet → friendlier copy.
      if (/sms|provider|not enabled|disabled/i.test(msg)) {
        setErr(t('تسجيل الدخول عبر الجوال غير مفعّل بعد. استخدم البريد أو Google.', 'Phone sign-in is not enabled yet. Use email or Google.'));
      } else {
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success) { setErr(t('رمز غير صالح', 'Invalid code')); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: parsed.data, type: 'sms' });
      if (error) throw error;
      toast.success(t('تم التحقق', 'Verified'));
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={step === 'phone' ? requestCode : verify} className="space-y-4" noValidate>
      {step === 'phone' ? (
        <>
          <label htmlFor="phone" className="block text-sm text-foreground/80 mb-1.5">
            {t('رقم الجوال', 'Mobile number')}
          </label>
          <div className="relative">
            <Phone className="size-4 absolute inset-y-0 start-3 my-auto text-muted-foreground" aria-hidden="true" />
            <input
              id="phone"
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+9665XXXXXXXX"
              className="w-full h-11 rounded-xl bg-background/60 backdrop-blur border border-border text-foreground ps-10 pe-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </>
      ) : (
        <>
          <label htmlFor="otp" className="block text-sm text-foreground/80 mb-1.5">
            {t('رمز التحقق (6 أرقام)', 'Verification code (6 digits)')}
          </label>
          <div className="relative">
            <KeyRound className="size-4 absolute inset-y-0 start-3 my-auto text-muted-foreground" aria-hidden="true" />
            <input
              id="otp"
              type="text"
              dir="ltr"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full h-11 rounded-xl bg-background/60 backdrop-blur border border-border text-foreground ps-10 pe-4 tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => { setStep('phone'); setCode(''); }}
            className="text-xs text-primary hover:underline"
          >
            {t('تغيير الرقم', 'Change number')}
          </button>
        </>
      )}

      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-destructive">{err}</div>

      <button
        type="submit"
        disabled={busy}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {step === 'phone'
          ? t('إرسال الرمز', 'Send code')
          : t('تحقّق ودخول', 'Verify & continue')}
      </button>
    </form>
  );
}
