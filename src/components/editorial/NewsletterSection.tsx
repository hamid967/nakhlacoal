import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Eyebrow } from './primitives';

export function NewsletterSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      setStatus('err');
      setMsg(isAr ? 'أدخل بريداً صحيحاً' : 'Please enter a valid email');
      return;
    }
    setStatus('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: clean,
      locale: isAr ? 'ar' : 'en',
      source: 'home_newsletter',
    });
    if (error && !/duplicate|unique/i.test(error.message)) {
      setStatus('err');
      setMsg(isAr ? 'تعذّر الاشتراك، حاول لاحقاً' : 'Subscription failed, try again');
      return;
    }
    setStatus('ok');
    setMsg(
      isAr
        ? 'تم الاشتراك — نراك في نشرتنا القادمة.'
        : 'Subscribed — see you in the next issue.',
    );
    setEmail('');
  }

  return (
    <section
      className="relative bg-dark text-dark-foreground py-24 lg:py-32 overflow-hidden"
      aria-labelledby="newsletter-heading"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -bottom-40 h-80 pointer-events-none"
        style={{ background: 'var(--gradient-ember)' }}
      />

      <div className="relative container">
        <div
          className="max-w-2xl mx-auto text-center"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="flex justify-center mb-6">
            <Eyebrow>{isAr ? 'نشرة فحم النخلة' : 'Palm Charcoal Dispatch'}</Eyebrow>
          </div>
          <h2
            id="newsletter-heading"
            className="font-editorial-bold text-dark-foreground leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            {isAr ? (
              <>
                رسائل من <span className="text-gold italic">النار.</span>
              </>
            ) : (
              <>
                Letters from the <span className="text-gold italic">fire.</span>
              </>
            )}
          </h2>
          <p className="mt-6 text-dark-foreground/70 text-base leading-relaxed max-w-md mx-auto">
            {isAr
              ? 'حكايات الحرفة، تقارير الجودة، دعوات خاصة وعروض للجملة — مرة كل شهر، دون ضجيج.'
              : 'Craft stories, quality reports, private invites and wholesale offers — once a month, no noise.'}
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {isAr ? 'البريد الإلكتروني' : 'Email address'}
            </label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'err') setStatus('idle');
              }}
              placeholder={isAr ? 'بريدك@الإلكتروني.com' : 'you@address.com'}
              className="flex-1 h-12 px-5 rounded-none bg-transparent border border-gold/40 text-dark-foreground placeholder:text-dark-foreground/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-colors"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-gradient-to-br from-gold-hi to-gold-lo text-dark font-semibold text-sm uppercase tracking-[0.18em] hover:-translate-y-0.5 hover:shadow-glow-gold transition-all duration-300 disabled:opacity-60 disabled:cursor-wait"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : status === 'ok' ? (
                <Check className="w-4 h-4" aria-hidden />
              ) : (
                <Send className="w-4 h-4" aria-hidden />
              )}
              <span>
                {status === 'ok'
                  ? isAr
                    ? 'تم'
                    : 'Done'
                  : isAr
                    ? 'اشترك'
                    : 'Subscribe'}
              </span>
            </button>
          </form>

          {msg ? (
            <p
              role={status === 'err' ? 'alert' : 'status'}
              className={`mt-4 text-xs tracking-wide ${status === 'err' ? 'text-ember-hi' : 'text-gold-hi'}`}
            >
              {msg}
            </p>
          ) : null}

          <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-dark-foreground/40">
            {isAr ? 'إلغاء الاشتراك بنقرة واحدة — دائماً.' : 'One-click unsubscribe — always.'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
