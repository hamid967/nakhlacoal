import { useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

type Provider = 'google' | 'apple';

interface Props {
  isAr: boolean;
  redirectTo?: string;
}

export function OAuthButtons({ isAr, redirectTo }: Props) {
  const [busy, setBusy] = useState<Provider | null>(null);

  const handle = async (provider: Provider) => {
    setBusy(provider);
    try {
      // Stash desired post-auth route so the AuthContext can consume it.
      if (redirectTo) sessionStorage.setItem('post-auth-redirect', redirectTo);
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(
          isAr ? 'تعذّر تسجيل الدخول' : 'Sign-in failed',
          { description: result.error.message }
        );
        setBusy(null);
        return;
      }
      if (result.redirected) return; // browser navigates away
      // Token returned, session established — outer page handles redirect.
    } catch (e) {
      toast.error(isAr ? 'تعذّر تسجيل الدخول' : 'Sign-in failed');
      setBusy(null);
    }
  };

  const baseBtn =
    'flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-background/60 backdrop-blur-md text-sm font-medium text-foreground transition hover:bg-background hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => handle('google')}
        disabled={busy !== null}
        className={baseBtn}
        aria-label={isAr ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}
      >
        <GoogleIcon />
        <span>{busy === 'google' ? '…' : 'Google'}</span>
      </button>
      <button
        type="button"
        onClick={() => handle('apple')}
        disabled={busy !== null}
        className={baseBtn}
        aria-label={isAr ? 'تسجيل الدخول بـ Apple' : 'Sign in with Apple'}
      >
        <AppleIcon />
        <span>{busy === 'apple' ? '…' : 'Apple'}</span>
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.47 1.18 4.95l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" className="fill-current">
      <path d="M13.18 9.55c-.02-2.05 1.67-3.04 1.75-3.09-.95-1.39-2.43-1.58-2.96-1.6-1.26-.13-2.46.74-3.1.74-.65 0-1.63-.72-2.69-.7-1.38.02-2.66.8-3.37 2.04-1.44 2.5-.37 6.18 1.03 8.2.69.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.66-.66 1.24 0 1.59.66 2.68.64 1.11-.02 1.81-1 2.49-2 .79-1.15 1.11-2.26 1.13-2.32-.03-.01-2.17-.83-2.19-3.31ZM11.2 3.55c.57-.69.95-1.66.85-2.62-.82.03-1.81.54-2.4 1.23-.53.61-.99 1.6-.87 2.55.91.07 1.85-.46 2.42-1.16Z"/>
    </svg>
  );
}
