import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const STATUS_AR: Record<string, { title: string; body: (price: number | null) => string }> = {
  new: {
    title: 'استلمنا طلب عرض السعر',
    body: () => 'وصلنا طلبك بنجاح. سيقوم فريق المبيعات بمراجعة الكميّة وإعداد أفضل عرض خلال وقت قصير.',
  },
  under_review: {
    title: 'عرض السعر قيد المراجعة',
    body: () => 'يعمل فريقنا حالياً على تسعير طلبك بناءً على الكميّة والوجهة المطلوبة.',
  },
  priced: {
    title: 'تم إعداد عرض السعر',
    body: (p) => p
      ? `يسرّنا تقديم عرض السعر التالي: <b>${Number(p).toFixed(2)} ر.س</b> للوحدة (شامل ضريبة القيمة المضافة عند التطبيق). العرض ساري لمدة 7 أيام.`
      : 'تم إعداد عرض السعر الخاص بك، يرجى مراجعته عبر حسابك في بوابة العملاء.',
  },
  accepted: {
    title: 'تم قبول عرض السعر',
    body: () => 'شكراً لقبولك العرض! سيتواصل معك فريقنا لإتمام إجراءات الدفع والشحن.',
  },
  rejected: {
    title: 'تم إغلاق عرض السعر',
    body: () => 'تم إغلاق طلب عرض السعر. إذا كنت ترغب بمناقشة الأسعار أو الشروط راسلنا مباشرة.',
  },
  converted_to_order: {
    title: 'تم تحويل عرض السعر إلى طلب',
    body: () => 'ممتاز! تم إنشاء طلب رسمي بناءً على العرض المتفق عليه. ستصلك تحديثات حالة الطلب تباعاً.',
  },
};
const ALLOWED = Object.keys(STATUS_AR);

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jhdr });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: authErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jhdr });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const userId = claims.claims.sub as string;
    const { data: isAdmin, error: roleErr } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: jhdr });
    }

    const { quoteId, status } = await req.json();
    if (!quoteId || typeof quoteId !== 'string' || !status || typeof status !== 'string') {
      return new Response(JSON.stringify({ error: 'quoteId and status are required' }), { status: 400, headers: jhdr });
    }
    if (!ALLOWED.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: jhdr });
    }

    const { data: q } = await admin.from('quote_requests').select('*').eq('id', quoteId).maybeSingle();
    if (!q?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), { headers: jhdr });
    }

    const s = STATUS_AR[status];
    const price = q.quoted_price_sar ? Number(q.quoted_price_sar) : null;
    const qid = String(q.id).slice(0, 8).toUpperCase();
    const details = `${esc(q.product)} · ${esc(q.quantity)} ${esc(q.unit)}` + (q.destination ? ` · ${esc(q.destination)}` : '');

    const html = brandedShell({
      title: s.title,
      bodyHtml: `<p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${esc(q.full_name || q.company_name || '')},</p>
        <p style="margin:0 0 20px;line-height:1.8;color:#333">${s.body(price)}</p>`,
      cardLabel: 'QUOTE',
      cardValue: `#${qid}`,
      cardExtra: details,
    });

    const result = await sendEmail({
      template: `quote-${status}`,
      to: q.email,
      subject: `${s.title} — #${qid}`,
      html,
      from: 'فحم النخلة | Palm Charcoal <quotes@notify.alnakhlacoal.com>',
      entityType: 'quote_request',
      entityId: q.id,
      triggeredBy: userId,
      metadata: { status },
      admin,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), { status: 502, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true, id: result.id }), { headers: jhdr });
  } catch (e) {
    console.error('[send-quote-status-email] error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jhdr });
  }
});
