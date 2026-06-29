import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { otpSchema } from './schemas';

interface Props {
  isAr: boolean;
  onVerified: () => void;
}

/**
 * Renders a TOTP MFA challenge if the just-signed-in user has an enrolled
 * factor that still needs verification. Otherwise stays invisible.
 */
export function TwoFactorChallenge({ isAr, onVerified }: Props) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: levels } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (cancelled) return;
      if (!levels) return;
      if (levels.currentLevel === levels.nextLevel) return;
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f) => f.status === 'verified');
      if (!totp) return;
      const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (error || !challenge || cancelled) return;
      setFactorId(totp.id);
      setChallengeId(challenge.id);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!factorId || !challengeId) return null;

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success) { setErr(t('رمز غير صالح', 'Invalid code')); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: parsed.data,
      });
      if (error) throw error;
      onVerified();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'unknown');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/80 backdrop-blur-xl">
      <form
        onSubmit={verify}
        className="w-full max-w-sm m-4 p-6 rounded-2xl border border-border bg-card shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mfa-title"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
          <h2 id="mfa-title" className="font-serif text-lg text-foreground">
            {t('التحقق بخطوتين', 'Two-factor verification')}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة لديك.', 'Enter the 6-digit code from your authenticator app.')}
        </p>
        <input
          type="text"
          dir="ltr"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          aria-label={t('رمز التحقق', 'Verification code')}
          className="w-full h-12 rounded-xl bg-background/60 backdrop-blur border border-border text-center tracking-[0.5em] font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div aria-live="polite" className="min-h-[1.25rem] text-sm text-destructive">{err}</div>
        <button
          type="submit"
          disabled={busy}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t('تحقّق', 'Verify')}
        </button>
      </form>
    </div>
  );
}
