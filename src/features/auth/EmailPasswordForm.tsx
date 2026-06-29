import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { signInSchema, signUpSchema } from './schemas';

interface Props {
  isAr: boolean;
  mode: 'signin' | 'signup';
  onForgot: () => void;
  onSuccess: () => void;
}

export function EmailPasswordForm({ isAr, mode, onForgot, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const t = (ar: string, en: string) => (isAr ? ar : en);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    const parsed =
      mode === 'signup'
        ? signUpSchema.safeParse({ name, email, password })
        : signInSchema.safeParse({ email, password, remember });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      setErr(first || 'invalid_input');
      return;
    }

    // Honor "Remember me": session storage when off, default localStorage when on.
    if (mode === 'signin') {
      try {
        const store = remember ? window.localStorage : window.sessionStorage;
        store.setItem('palm-auth-persist', remember ? 'persistent' : 'session');
      } catch {/* noop */}
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success(t('تم إنشاء الحساب — تحقق من بريدك', 'Account created — check your inbox'));
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t('أهلًا بعودتك', 'Welcome back'));
        onSuccess();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setErr(msg);
      toast.error(t('فشل تسجيل الدخول', 'Authentication failed'), { description: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === 'signup' && (
        <Field
          id="name"
          type="text"
          label={t('الاسم الكامل', 'Full name')}
          autoComplete="name"
          value={name}
          onChange={setName}
          required
        />
      )}

      <Field
        id="email"
        type="email"
        label={t('البريد الإلكتروني', 'Email')}
        icon={<Mail className="size-4" aria-hidden="true" />}
        autoComplete="email"
        value={email}
        onChange={setEmail}
        required
      />

      <Field
        id="password"
        type={show ? 'text' : 'password'}
        label={t('كلمة المرور', 'Password')}
        icon={<Lock className="size-4" aria-hidden="true" />}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        value={password}
        onChange={setPassword}
        required
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label={show ? t('إخفاء كلمة المرور', 'Hide password') : t('إظهار كلمة المرور', 'Show password')}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />

      {mode === 'signin' && (
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-muted-foreground">{t('تذكّرني', 'Remember me')}</span>
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="text-primary hover:underline underline-offset-4"
          >
            {t('نسيت كلمة المرور؟', 'Forgot password?')}
          </button>
        </div>
      )}

      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-destructive">
        {err}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium tracking-wide flex items-center justify-center gap-2 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {mode === 'signup' ? t('إنشاء الحساب', 'Create account') : t('تسجيل الدخول', 'Sign in')}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

function Field({ id, label, type, value, onChange, autoComplete, required, icon, trailing }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-foreground/80 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 start-3 flex items-center text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 rounded-xl bg-background/60 backdrop-blur border border-border text-foreground placeholder:text-muted-foreground/60 transition focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${icon ? 'ps-10' : 'ps-4'} ${trailing ? 'pe-10' : 'pe-4'}`}
        />
        {trailing && (
          <span className="absolute inset-y-0 end-3 flex items-center">{trailing}</span>
        )}
      </div>
    </div>
  );
}
