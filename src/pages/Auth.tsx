import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/features/auth/AuthCard';
import { BrandCanvas } from '@/features/auth/BrandCanvas';
import { TwoFactorChallenge } from '@/features/auth/TwoFactorChallenge';
import { resolveRoleRoute, sanitizeFrom } from '@/features/auth/useRoleRedirect';

export default function Auth() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, loading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [mfaPassed, setMfaPassed] = useState(false);

  const t = (ar: string, en: string) => (isAr ? ar : en);

  const queryFrom = new URLSearchParams(location.search).get('from');
  const stateFrom = (location.state as { from?: string } | null)?.from;
  const explicitFrom = sanitizeFrom(queryFrom ?? stateFrom);

  // Resolve the post-auth target route from role-based mapping, with a
  // sanitized `from` taking precedence when present.
  const target = useMemo(() => {
    if (explicitFrom) return explicitFrom;
    const stored = (() => {
      try { return sessionStorage.getItem('post-auth-redirect'); } catch { return null; }
    })();
    const sanitizedStored = sanitizeFrom(stored);
    if (sanitizedStored) return sanitizedStored;
    return resolveRoleRoute(roles);
  }, [explicitFrom, roles]);

  // Auto-redirect once we have a user, roles are fetched, and MFA (if any) is clear.
  useEffect(() => {
    if (!user || loading) return;
    if (!mfaPassed) return;
    try { sessionStorage.removeItem('post-auth-redirect'); } catch {/* noop */}
    navigate(target, { replace: true });
  }, [user, loading, mfaPassed, target, navigate]);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      toast.success(t('تم تسجيل الخروج', 'Signed out'));
    } catch (e) {
      toast.error(t('فشل تسجيل الخروج', 'Sign-out failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('تسجيل الدخول | فحم النخلة', 'Sign In | Palm Charcoal')}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={t('بوابة دخول آمنة لعملاء وشركاء فحم النخلة.', 'Secure access portal for Palm Charcoal clients & partners.')} />
      </Helmet>

      <section
        className="relative grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.2fr_1fr]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <BrandCanvas isAr={isAr} />

        {/* Right: auth surface */}
        <div className="relative flex items-center justify-center px-4 py-12 sm:px-8 lg:py-16">
          {/* Mobile ambient background */}
          <div
            className="lg:hidden absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]"
            aria-hidden="true"
          />

          <AnimatePresence mode="wait">
            {user && !loading ? (
              <motion.div
                key="signed-in"
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl p-8 text-center shadow-2xl"
              >
                <h1 className="font-serif text-2xl text-foreground">
                  {t('أنت مسجّل الدخول', 'You are signed in')}
                </h1>
                <p className="text-sm text-muted-foreground mt-2 break-all">{user.email}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-primary mt-4">
                  {t('جارٍ التوجيه…', 'Redirecting…')}
                </p>
                <div className="flex flex-col gap-2 mt-6">
                  <Link
                    to={target}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium grid place-items-center hover:opacity-90 transition"
                  >
                    {t('المتابعة', 'Continue')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={busy}
                    className="w-full h-11 rounded-xl border border-border bg-background/60 text-foreground inline-flex items-center justify-center gap-2 hover:bg-muted transition disabled:opacity-60"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    {busy ? '…' : t('تسجيل الخروج', 'Sign out')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <AuthCard
                key="auth-card"
                isAr={isAr}
                redirectTo={target}
                onSuccess={() => { /* navigation happens via auth-state effect */ }}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {user && !mfaPassed && (
        <TwoFactorChallenge isAr={isAr} onVerified={() => setMfaPassed(true)} />
      )}
      {user && mfaPassed === false && (
        // Hidden auto-clear: if no factor enrollment exists, TwoFactorChallenge
        // renders null and we still need to release the redirect gate.
        <MfaAutoPass onPass={() => setMfaPassed(true)} />
      )}
    </>
  );
}

/**
 * Fallback that releases the MFA gate when the account has no enrolled factor.
 * It checks once after auth and flips `mfaPassed` so the redirect can proceed.
 */
function MfaAutoPass({ onPass }: { onPass: () => void }) {
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.auth.mfa.listFactors();
        const verified = data?.totp?.some((f) => f.status === 'verified');
        if (!verified && alive) onPass();
        if (verified) {
          // Defer to TwoFactorChallenge; do nothing here.
        }
      } catch {
        if (alive) onPass();
      }
    })();
    return () => { alive = false; };
  }, [onPass]);
  return null;
}
