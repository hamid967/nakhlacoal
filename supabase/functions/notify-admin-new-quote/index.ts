import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const DEFAULT_ADMIN_EMAIL = 'nakhlacoal@gmail.com';

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { quoteId } = await req.json().catch(() => ({}));
    if (!quoteId || typeof quoteId !== 'string') {
      return new Response(JSON.stringify({ error: 'quoteId is required' }), { status: 400, headers: jhdr });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: settings } = await admin
      .from('email_settings')
      .select('auto_admin_quote_alert, admin_notify_email')
      .eq('id', true)
      .maybeSingle();

    if (settings && settings.auto_admin_quote_alert === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: jhdr });
    }

    const recipient = (settings?.admin_notify_email || DEFAULT_ADMIN_EMAIL).trim();

    const { data: q, error } = await admin
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (error || !q) {
      return new Response(JSON.stringify({ error: 'quote not found' }), { status: 404, headers: jhdr });
    }

    const qid = String(q.id).slice(0, 8).toUpperCase();
    const rows: [string, string][] = [
      ['رقم الطلب', qid],
      ['الاسم', q.name || '—'],
      ['البريد', q.email || '—'],
      ['الجوال', q.phone || '—'],
      ['المنتج', q.product || '—'],
      ['الكمية', `${q.quantity ?? '—'} ${q.unit ?? ''}`.trim()],
      ['الوجهة', q.destination || '—'],
      ['الحالة', q.status || 'new'],
      ['ملاحظات', q.notes || '—'],
    ];

    const table = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:140px">${esc(k)}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0A0B09"><b>${esc(String(v))}</b></td></tr>`
    ).join('');

    const html = brandedShell({
      title: 'طلب عرض سعر جديد',
      intro: `تم استلام طلب عرض سعر جديد رقم <b>${esc(qid)}</b>. يرجى المراجعة والرد على العميل في أقرب وقت.`,
      bodyHtml: `<table style="width:100%;border-collapse:collapse;font-family:inherit">${table}</table>`,
      ctaLabel: 'فتح لوحة الإدارة',
      ctaUrl: 'https://alnakhlacoal.com/admin/quotes',
    });

    const result = await sendEmail({
      template: 'admin-new-quote-alert',
      to: recipient,
      subject: `طلب عرض سعر جديد — ${qid}`,
      html,
      entityType: 'quote_request',
      entityId: q.id,
      category: 'transactional',
      admin,
      metadata: { alertType: 'admin_new_quote' },
    });

    return new Response(JSON.stringify(result), { status: result.ok ? 200 : 502, headers: jhdr });
  } catch (err) {
    console.error('[notify-admin-new-quote]', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: jhdr });
  }
});
