import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Phone, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/BrandLogo';
import { Helmet } from 'react-helmet-async';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^(\+?966|0)?5\d{8}$/;

export default function PortalLogin() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') || '/portal';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => { document.title = 'بوابة العملاء — دخول | فحم النخلة'; }, []);

  if (!loading && user) return <Navigate to={from} replace />;

  const validate = () => {
    if (!emailRe.test(email.trim())) { toast.error('بريد إلكتروني غير صحيح'); return false; }
    if (password.length < 8) { toast.error('كلمة المرور 8 أحرف على الأقل'); return false; }
    if (mode === 'signup') {
      if (fullName.trim().length < 2) { toast.error('الاسم الكامل مطلوب'); return false; }
      if (!phoneRe.test(phone.trim())) { toast.error('رقم جوال سعودي غير صحيح'); return false; }
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (!data.session) throw new Error('تعذّر إنشاء الجلسة');
        toast.success('مرحباً بعودتك 🌴');
        navigate(from, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success('تم إنشاء حسابك — مرحباً بك 🌴');
          navigate(from, { replace: true });
        } else {
          toast.success('تم إنشاء حسابك — تحقق من بريدك للتفعيل');
          setMode('signin');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'حدث خطأ';
      toast.error(
        msg.includes('Invalid login') ? 'بيانات الدخول غير صحيحة' :
        msg.includes('already registered') || msg.includes('already been registered') ? 'البريد مسجّل مسبقاً' :
        msg.includes('Password') && msg.includes('pwned') ? 'كلمة المرور مكشوفة في تسريبات — اختر أقوى' :
        msg
      );
    } finally { setBusy(false); }
  };

  const google = async () => {
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      toast.success('مرحباً بك 🌴');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'تعذّر تسجيل الدخول بجوجل');
    } finally {
      setGoogleBusy(false);
    }
  };

  const forgot = async () => {
    if (!emailRe.test(email.trim())) { toast.error('أدخل بريدك أولاً'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) toast.error(error.message);
    else toast.success('تم إرسال رابط إعادة التعيين إلى بريدك');
  };

  return (
    <>
    <Helmet>
      <title>بوابة العملاء — دخول | فحم النخلة</title>
      <meta name="description" content="بوابة عملاء فحم النخلة: سجّل الدخول أو أنشئ حسابك لإدارة الطلبات والشحنات والفواتير بأمان." />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <main
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4 py-10 font-arabic relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 20% 10%, hsl(var(--gold)/0.10), transparent 55%), radial-gradient(circle at 85% 90%, hsl(var(--dark)/0.6), transparent 60%), hsl(var(--background))' }}
    >
      <Link
        to="/"
        className="absolute top-4 start-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> العودة للرئيسية
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-card/90 backdrop-blur-sm shadow-[0_20px_60px_-20px_hsl(var(--gold)/0.35)] overflow-hidden">
        <div
          className="px-6 py-5 text-cream text-center relative"
          style={{ background: 'linear-gradient(135deg, hsl(var(--dark)) 0%, hsl(0 0% 8%) 100%)' }}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--gold)/0.25),transparent_60%)] pointer-events-none" aria-hidden />
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full ring-1 ring-gold/40 mb-2"
               style={{ background: 'radial-gradient(circle at 30% 25%, hsl(var(--gold-hi)/0.4), hsl(0 0% 6%) 70%)' }}>
            <BrandLogo alt="فحم النخلة" className="w-11 h-11 object-contain" />
          </div>
          <h1 className="relative text-lg font-bold bg-gradient-to-l from-gold-hi via-cream to-gold-hi bg-clip-text text-transparent">
            بوابة العملاء
          </h1>
          <p className="relative text-[11px] opacity-80 mt-0.5 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-gold-hi" /> دخول آمن لإدارة طلباتك وشحناتك
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted mb-5" role="tablist">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`py-2 rounded-md text-xs font-semibold transition ${
                  mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'signin' ? 'تسجيل الدخول' : 'حساب جديد'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <Field icon={User} label="الاسم الكامل">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="محمد أحمد"
                    className="input-lux"
                    autoComplete="name"
                  />
                </Field>
                <Field icon={Phone} label="رقم الجوال" ltr>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    inputMode="tel"
                    dir="ltr"
                    className="input-lux text-right"
                    autoComplete="tel"
                  />
                </Field>
              </>
            )}
            <Field icon={Mail} label="البريد الإلكتروني" ltr>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                className="input-lux text-right"
                autoComplete="email"
                required
              />
            </Field>
            <Field icon={Lock} label="كلمة المرور" ltr>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="input-lux text-right"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={8}
              />
            </Field>

            {mode === 'signin' && (
              <button
                type="button"
                onClick={forgot}
                className="text-[11px] text-gold hover:text-gold-hi underline underline-offset-2"
              >
                نسيت كلمة المرور؟
              </button>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-lg text-sm font-bold text-cream transition flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_hsl(var(--gold)/0.6)]"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--dark)) 0%, hsl(0 0% 10%) 100%)',
                boxShadow: '0 4px 14px -4px hsl(var(--gold) / 0.4), inset 0 1px 0 hsl(var(--gold-hi) / 0.35)',
              }}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              <span className="bg-gradient-to-l from-gold-hi to-cream bg-clip-text text-transparent">
                {mode === 'signin' ? 'دخول إلى البوابة' : 'إنشاء حساب'}
              </span>
            </button>
          </form>

          <div className="relative my-4 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> أو <span className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={google}
            disabled={googleBusy}
            className="w-full py-2.5 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-muted transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {googleBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.1 34.9 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.7 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.2 5.3C41.4 35.3 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z"/>
              </svg>
            )}
            المتابعة عبر جوجل
          </button>

          <p className="text-[10px] text-muted-foreground text-center mt-5 leading-relaxed">
            بالمتابعة أنت توافق على{' '}
            <Link to="/legal/terms" className="text-gold hover:underline">شروط الاستخدام</Link>{' '}
            و{' '}
            <Link to="/legal/privacy" className="text-gold hover:underline">سياسة الخصوصية</Link>.
          </p>
          <p className="text-[11px] text-center mt-3">
            بحاجة لحساب الموظفين؟{' '}
            <Link to="/auth" className="text-gold font-semibold hover:underline">دخول النظام الداخلي</Link>
          </p>
        </div>
      </div>
    </main>
    </>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  ltr,
}: { icon: any; label: string; children: React.ReactNode; ltr?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground mb-1 block">{label}</span>
      <div className="relative">
        <Icon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gold/70 pointer-events-none" aria-hidden />
        <div className="[&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-border [&_input]:bg-background [&_input]:ps-9 [&_input]:pe-3 [&_input]:py-2.5 [&_input]:text-[15px] sm:[&_input]:text-sm [&_input]:transition focus-within:[&_input]:ring-2 focus-within:[&_input]:ring-gold/40 focus-within:[&_input]:border-gold [&_input]:outline-none">
          {children}
        </div>
      </div>
    </label>
  );
}
