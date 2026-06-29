import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { emailSchema } from './schemas';
import { EmailPasswordForm } from './EmailPasswordForm';
import { MagicLinkForm } from './MagicLinkForm';
import { PhoneOtpForm } from './PhoneOtpForm';
import { OAuthButtons } from './OAuthButtons';

type Tab = 'password' | 'magic' | 'phone';
type View = 'auth' | 'forgot';

interface Props {
  isAr: boolean;
  redirectTo?: string;
  onSuccess: () => void;
}

const TABS: { id: Tab; ar: string; en: string }[] = [
  { id: 'password', ar: 'كلمة المرور', en: 'Password' },
  { id: 'magic', ar: 'رابط سحري', en: 'Magic link' },
  { id: 'phone', ar: 'الجوال', en: 'Phone' },
];

export function AuthCard({ isAr, redirectTo, onSuccess }: Props) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>('auth');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [tab, setTab] = useState<Tab>('password');

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative w-full max-w-md"
    >
      {/* Gold rim glow */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/40 via-transparent to-primary/20 opacity-60 blur-sm" aria-hidden="true" />
      <div
        className="relative rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl p-7 sm:p-8"
        role="region"
        aria-label={t('نموذج تسجيل الدخول', 'Authentication form')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {view === 'forgot' ? (
            <ForgotView key="forgot" isAr={isAr} onBack={() => setView('auth')} />
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={{ duration: 0.35 }}
            >
              <header className="text-center mb-6">
                <h1 className="font-serif text-3xl text-foreground">
                  {mode === 'signin' ? t('تسجيل الدخول', 'Welcome back') : t('إنشاء حساب', 'Create account')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('فحم النخلة — للعملاء والشركاء', 'Palm Charcoal — for clients & partners')}
                </p>
              </header>

              <OAuthButtons isAr={isAr} redirectTo={redirectTo} />

              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                {t('أو', 'or')}
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Method tabs */}
              <div
                role="tablist"
                aria-label={t('طرق تسجيل الدخول', 'Sign-in methods')}
                className="grid grid-cols-3 p-1 rounded-xl bg-muted/60 mb-5"
              >
                {TABS.map((entry) => {
                  const active = tab === entry.id;
                  return (
                    <button
                      key={entry.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setTab(entry.id)}
                      className={`relative h-9 rounded-lg text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="auth-tab-pill"
                          className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/60"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{t(entry.ar, entry.en)}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab + mode}
                  initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {tab === 'password' && (
                    <EmailPasswordForm
                      isAr={isAr}
                      mode={mode}
                      onForgot={() => setView('forgot')}
                      onSuccess={onSuccess}
                    />
                  )}
                  {tab === 'magic' && <MagicLinkForm isAr={isAr} />}
                  {tab === 'phone' && <PhoneOtpForm isAr={isAr} onSuccess={onSuccess} />}
                </motion.div>
              </AnimatePresence>

              {tab === 'password' && (
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  {mode === 'signin' ? (
                    <>
                      {t('ليس لديك حساب؟', "Don't have an account?")}{' '}
                      <button type="button" onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">
                        {t('إنشاء حساب', 'Create one')}
                      </button>
                    </>
                  ) : (
                    <>
                      {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                      <button type="button" onClick={() => setMode('signin')} className="text-primary hover:underline font-medium">
                        {t('سجّل الدخول', 'Sign in')}
                      </button>
                    </>
                  )}
                </p>
              )}

              <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
                {t(
                  'بمتابعتك فإنك توافق على شروط الاستخدام وسياسة الخصوصية. محمي بآليات كشف الاحتيال غير المرئية.',
                  'By continuing you agree to the Terms & Privacy. Protected by invisible fraud-detection.'
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ForgotView({ isAr, onBack }: { isAr: boolean; onBack: () => void }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { setErr(t('بريد إلكتروني غير صالح', 'Invalid email')); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) throw error;
      setSent(true);
      toast.success(t('تم إرسال رابط الاستعادة', 'Reset link sent'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'unknown');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t('رجوع', 'Back')}
      </button>
      <h2 className="font-serif text-2xl text-foreground mb-1">
        {t('استعادة كلمة المرور', 'Reset your password')}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        {t('سنرسل لك رابطًا آمنًا لإعادة التعيين.', "We'll email you a secure reset link.")}
      </p>

      {sent ? (
        <div className="text-sm text-foreground bg-muted/50 rounded-xl p-4">
          {t('تحقّق من بريدك:', 'Check your inbox:')} <span className="font-medium">{email}</span>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="relative">
            <Mail className="size-4 absolute inset-y-0 start-3 my-auto text-muted-foreground" aria-hidden="true" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label={t('البريد الإلكتروني', 'Email')}
              className="w-full h-11 rounded-xl bg-background/60 backdrop-blur border border-border text-foreground ps-10 pe-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div aria-live="polite" className="min-h-[1.25rem] text-sm text-destructive">{err}</div>
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t('إرسال رابط الاستعادة', 'Send reset link')}
          </button>
        </form>
      )}
    </motion.div>
  );
}
