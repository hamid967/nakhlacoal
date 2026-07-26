import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const DEFAULT_ADMIN_EMAIL = 'nakhlacoal@gmail.com';
const APP_URL = 'https://alnakhlacoal.com';

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { zatcaInvoiceId } = await req.json().catch(() => ({}));
    if (!zatcaInvoiceId || typeof zatcaInvoiceId !== 'string') {
      return new Response(JSON.stringify({ error: 'zatcaInvoiceId is required' }), { status: 400, headers: jhdr });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: settings } = await admin
      .from('email_settings')
      .select('auto_zatca_failure_alert, zatca_alert_threshold, admin_notify_email, slack_webhook_url')
      .eq('id', true)
      .maybeSingle();

    if (settings && settings.auto_zatca_failure_alert === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: jhdr });
    }

    const recipient = (settings?.admin_notify_email || DEFAULT_ADMIN_EMAIL).trim();
    const slackUrl = (settings?.slack_webhook_url || '').trim();

    const { data: zi, error } = await admin
      .from('zatca_invoices')
      .select('id, invoice_id, icv, pih, uuid, status, attempts, last_error, submission_type, invoice_type, created_at, submitted_at, credential_id')
      .eq('id', zatcaInvoiceId)
      .maybeSingle();

    if (error || !zi) {
      return new Response(JSON.stringify({ error: 'zatca invoice not found' }), { status: 404, headers: jhdr });
    }

    // Avoid duplicate alert for same failure streak
    const { data: existing } = await admin
      .from('zatca_invoices')
      .select('alerted_at, alert_count, status')
      .eq('id', zatcaInvoiceId)
      .maybeSingle();

    if (existing?.alerted_at && existing.status === zi.status) {
      return new Response(JSON.stringify({ skipped: true, reason: 'already_alerted' }), { headers: jhdr });
    }

    const { data: env } = await admin
      .from('zatca_credentials')
      .select('environment, organization_name_ar, organization_name_en')
      .eq('id', zi.credential_id)
      .maybeSingle();

    const environment = env?.environment || 'sandbox';
    const orgName = env?.organization_name_ar || env?.organization_name_en || '—';

    const invoiceUrl = `${APP_URL}/admin/zatca?invoice=${encodeURIComponent(zi.id)}&env=${encodeURIComponent(environment)}`;
    const shortId = String(zi.id).slice(0, 8).toUpperCase();
    const errMsg = (zi.last_error || '').slice(0, 800) || '—';
    const envLabel = environment === 'production' ? 'الإنتاج (Production)' : 'الاختبار (Sandbox)';
    const envColor = environment === 'production' ? '#B91C1C' : '#B45309';

    const rows: [string, string][] = [
      ['المعرّف', shortId],
      ['UUID', zi.uuid || '—'],
      ['رقم الفاتورة الداخلي', String(zi.invoice_id || '—').slice(0, 12)],
      ['ICV', String(zi.icv ?? '—')],
      ['البيئة', envLabel],
      ['نوع الإرسال', zi.submission_type || '—'],
      ['الحالة', zi.status || '—'],
      ['عدد المحاولات', String(zi.attempts ?? 0)],
      ['المؤسسة', orgName],
    ];

    const infoTable = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:160px">${esc(k)}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0A0B09" dir="ltr"><b>${esc(String(v))}</b></td></tr>`
    ).join('');

    const html = brandedShell({
      title: 'تنبيه: فشل إرسال/توقيع فاتورة ZATCA',
      bodyHtml: `
        <div style="background:${envColor};color:#fff;padding:12px 16px;border-radius:10px;margin-bottom:20px;text-align:center;font-weight:600;letter-spacing:1px">
          بيئة ${esc(envLabel)}
        </div>
        <p style="margin:0 0 12px;color:#333;line-height:1.7">
          فشلت فاتورة ZATCA <b>${esc(shortId)}</b> بعد <b>${esc(String(zi.attempts ?? 0))}</b> محاولة.
          الحالة الحالية: <b>${esc(zi.status || '—')}</b>.
        </p>

        <h3 style="margin:20px 0 8px;font-size:14px;color:#0A0B09;letter-spacing:1px">تفاصيل الفاتورة</h3>
        <table style="width:100%;border-collapse:collapse;font-family:inherit">${infoTable}</table>

        <h3 style="margin:24px 0 8px;font-size:14px;color:#B91C1C;letter-spacing:1px">آخر خطأ</h3>
        <pre style="background:#fef2f2;border:1px solid #fecaca;color:#7f1d1d;padding:12px;border-radius:8px;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.55;margin:0">${esc(errMsg)}</pre>

        <div style="margin-top:28px;text-align:center">
          <a href="${invoiceUrl}" style="display:inline-block;background:#0A0B09;color:#B7923E;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;margin:4px">فتح الفاتورة في المراقبة</a>
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:#8a8674;text-align:center;direction:ltr">${esc(invoiceUrl)}</p>`,
    });

    const emailRes = await sendEmail({
      template: 'zatca-failure-alert',
      to: recipient,
      subject: `تنبيه ZATCA: فشل فاتورة ${shortId} (${environment}) — ${zi.attempts ?? 0} محاولات`,
      html,
      entityType: 'zatca_invoice',
      entityId: zi.id,
      category: 'transactional',
      admin,
      metadata: { alertType: 'zatca_failure', environment, attempts: zi.attempts },
    });

    // Optional Slack webhook
    let slackOk = false;
    if (slackUrl) {
      try {
        const slackRes = await fetch(slackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `:rotating_light: *ZATCA failure* — ${shortId} (${environment})\n*Attempts:* ${zi.attempts ?? 0} • *Status:* ${zi.status}\n*Error:* ${errMsg.slice(0, 300)}\n<${invoiceUrl}|Open invoice in monitor>`,
          }),
        });
        slackOk = slackRes.ok;
      } catch (e) {
        console.error('[zatca-alert-failure] slack', e);
      }
    }

    await admin
      .from('zatca_invoices')
      .update({
        alerted_at: new Date().toISOString(),
        alert_count: (existing?.alert_count ?? 0) + 1,
      })
      .eq('id', zi.id);

    return new Response(
      JSON.stringify({ ok: emailRes.ok, slack: slackOk, invoiceUrl }),
      { status: emailRes.ok ? 200 : 502, headers: jhdr },
    );
  } catch (err) {
    console.error('[zatca-alert-failure]', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: jhdr });
  }
});
