import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/contexts/AuthContext';

const emailSchema = z.string().trim().email({ message: 'invalid_email' }).max(255);
const passwordSchema = z.string().min(8, { message: 'password_short' }).max(72);
const nameSchema = z.string().trim().min(2, { message: 'name_short' }).max(60);

export default function Auth() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const t = (ar: string, en: string) => (isAr ? ar : en);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      toast.success(t('تم تسجيل الخروج', 'Signed out'));
      navigate('/', { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-out failed';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };


  const errMsg = (code: string) => {
    const map: Record<string, [string, string]> = {
      invalid_email: ['بريد إلكتروني غير صحيح', 'Invalid email address'],
      password_short: ['كلمة المرور 8 أحرف على الأقل', 'Password must be at least 8 characters'],
      name_short: ['الاسم قصير جداً', 'Name is too short'],
    };
    const [ar, en] = map[code] ?? [code, code];
    return isAr ? ar : en;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) return setErr(errMsg(emailRes.error.issues[0].message));
    const pwRes = passwordSchema.safeParse(password);
    if (!pwRes.success) return setErr(errMsg(pwRes.error.issues[0].message));

    setBusy(true);
    try {
      if (mode === 'signup') {
        const nameRes = nameSchema.safeParse(name);
        if (!nameRes.success) {
          setBusy(false);
          return setErr(errMsg(nameRes.error.issues[0].message));
        }
        const { error } = await supabase.auth.signUp({
          email: emailRes.data,
          password: pwRes.data,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: nameRes.data },
          },
        });
        if (error) throw error;
        toast.success(t('تم إنشاء الحساب. تحقق من بريدك لتأكيد الحساب.', 'Account created. Check your email to confirm.'));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailRes.data,
          password: pwRes.data,
        });
        if (error) throw error;
        toast.success(t('مرحباً بعودتك', 'Welcome back'));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Authentication failed';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErr(result.error.message ?? 'Google sign-in failed');
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('تسجيل الدخول | فحم النخلة', 'Sign In | Palm Charcoal')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
          {user ? (
            <div className="text-center space-y-4">
              <h1 className="font-serif text-2xl">{t('أنت مسجّل الدخول', 'You are signed in')}</h1>
              <p className="text-sm text-muted-foreground break-all">{user.email}</p>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/" className="w-full py-2.5 rounded-lg border border-input bg-background hover:bg-muted text-sm font-medium">
                  {t('الذهاب إلى الصفحة الرئيسية', 'Go to homepage')}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={busy}
                  className="w-full py-2.5 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {busy ? '...' : t('تسجيل الخروج', 'Sign out')}
                </button>
              </div>
              {err && <p className="text-xs text-destructive">{err}</p>}
            </div>
          ) : (
          <>

          <h1 className="font-serif text-3xl text-center mb-2">
            {mode === 'signin' ? t('تسجيل الدخول', 'Sign In') : t('إنشاء حساب', 'Create Account')}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {t('فحم النخلة — للعملاء والشركاء', 'Palm Charcoal — for clients & partners')}
          </p>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="w-full py-2.5 rounded-lg border border-input bg-background hover:bg-muted transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.2 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.2 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-1.9 1.3-4.3 2-7 2-5.2 0-9.6-3.1-11.2-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6 5.1c4-3.7 6.5-9.1 6.5-15.1 0-1.2-.1-2.3-.3-3z" />
            </svg>
            {t('المتابعة بحساب Google', 'Continue with Google')}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            {t('أو', 'OR')}
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} noValidate className="space-y-3 text-sm">
            {mode === 'signup' && (
              <div>
                <label className="block mb-1 text-muted-foreground">{t('الاسم الكامل', 'Full Name')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                />
              </div>
            )}
            <div>
              <label className="block mb-1 text-muted-foreground">{t('البريد الإلكتروني', 'Email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                autoComplete="email"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 text-muted-foreground">{t('كلمة المرور', 'Password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>

            {err && <p className="text-xs text-destructive">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {busy ? '...' : mode === 'signin' ? t('دخول', 'Sign In') : t('إنشاء حساب', 'Create Account')}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === 'signin' ? (
              <>
                {t('ليس لديك حساب؟', "Don't have an account?")}{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-primary underline">
                  {t('إنشاء حساب', 'Create one')}
                </button>
              </>
            ) : (
              <>
                {t('لديك حساب؟', 'Already have an account?')}{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-primary underline">
                  {t('سجّل الدخول', 'Sign in')}
                </button>
              </>
            )}
          </p>
          <p className="mt-2 text-center text-xs">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              {t('← العودة للصفحة الرئيسية', '← Back to home')}
            </Link>
          </p>
          </>
          )}
        </div>

      </section>
    </>
  );
}
