// Shared Resend sender + email_log recorder for Palm Charcoal edge functions.
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';
const DEFAULT_FROM = 'فحم النخلة | Palm Charcoal <no-reply@notify.alnakhlacoal.com>';
const DEFAULT_REPLY_TO = 'mab355@gmail.com';

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  content_type?: string;
}

export type EmailCategory =
  | 'order_updates'
  | 'shipment_updates'
  | 'invoice_receipts'
  | 'quote_updates'
  | 'marketing'
  | 'transactional'; // bypasses opt-in (password reset, admin tests, etc.)

export interface SendEmailInput {
  template: string;
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  triggeredBy?: string | null;
  admin?: SupabaseClient;
  attachments?: EmailAttachment[];
  category?: EmailCategory;
}

// Best-effort inference from template name when caller omits category.
function inferCategory(template: string): EmailCategory {
  const t = template.toLowerCase();
  if (t.includes('shipment')) return 'shipment_updates';
  if (t.includes('invoice')) return 'invoice_receipts';
  if (t.includes('quote')) return 'quote_updates';
  if (t.includes('order')) return 'order_updates';
  if (t.includes('marketing') || t.includes('promo') || t.includes('newsletter')) return 'marketing';
  return 'transactional';
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  status: number;
  error?: string;
  details?: unknown;
}

function getAdmin(client?: SupabaseClient): SupabaseClient {
  return client ?? createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

async function logEmail(
  admin: SupabaseClient,
  row: Record<string, unknown>,
): Promise<void> {
  const { error } = await admin.from('email_log').insert(row);
  if (error) console.error('[email_log] insert failed:', error);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const admin = getAdmin(input.admin);
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  const category = input.category ?? inferCategory(input.template);

  // Consent check (skipped for pure transactional/system emails).
  if (category !== 'transactional') {
    try {
      const { data: optedIn, error: optErr } = await admin.rpc('email_opted_in', {
        _email: input.to,
        _category: category,
      });
      if (optErr) console.error('[email_opted_in] rpc error:', optErr);
      if (optedIn === false) {
        await logEmail(admin, {
          template: input.template,
          recipient: input.to,
          subject: input.subject,
          status: 'skipped',
          error_message: `opt-out:${category}`,
          entity_type: input.entityType ?? null,
          entity_id: input.entityId ?? null,
          metadata: { ...(input.metadata ?? {}), category, skipped_reason: 'opt_out' },
          triggered_by: input.triggeredBy ?? null,
        });
        return { ok: false, status: 200, error: 'recipient opted out' };
      }
    } catch (e) {
      console.error('[consent] check failed, proceeding:', e);
    }
  }

  // Ensure a preferences row exists so the customer can manage it later.
  let unsubToken: string | null = null;
  try {
    const { data: existing } = await admin
      .from('email_preferences')
      .select('unsubscribe_token')
      .ilike('email', input.to)
      .maybeSingle();
    if (existing?.unsubscribe_token) {
      unsubToken = existing.unsubscribe_token;
    } else {
      const { data: inserted } = await admin
        .from('email_preferences')
        .insert({ email: input.to })
        .select('unsubscribe_token')
        .maybeSingle();
      unsubToken = inserted?.unsubscribe_token ?? null;
    }
  } catch (e) {
    console.error('[email_preferences] upsert failed:', e);
  }

  // Inject unsubscribe link placeholder.
  const siteUrl = Deno.env.get('SITE_URL') || 'https://alnakhlacoal.com';
  const unsubUrl = unsubToken
    ? `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubToken)}`
    : `${siteUrl}/portal/settings`;
  const htmlWithUnsub = input.html.includes('{{unsubscribe_url}}')
    ? input.html.replaceAll('{{unsubscribe_url}}', unsubUrl)
    : input.html.replace(
        /<\/body>/i,
        `<div style="text-align:center;padding:16px 24px;font-size:11px;color:#8a8674;font-family:'Segoe UI',Tahoma,Arial,sans-serif">
          لا ترغب باستلام هذه الإشعارات؟ <a href="${unsubUrl}" style="color:#1A4A00;text-decoration:underline">إلغاء الاشتراك</a>
        </div></body>`,
      );

  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    await logEmail(admin, {
      template: input.template,
      recipient: input.to,
      subject: input.subject,
      status: 'failed',
      error_message: 'Email service not configured',
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
      triggered_by: input.triggeredBy ?? null,
    });
    return { ok: false, status: 500, error: 'Email service not configured' };
  }


  try {
    const r = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: input.from ?? DEFAULT_FROM,
        reply_to: input.replyTo ?? DEFAULT_REPLY_TO,
        to: [input.to],
        subject: input.subject,
        html: htmlWithUnsub,
        ...(input.attachments && input.attachments.length
          ? { attachments: input.attachments.map((a) => ({
              filename: a.filename,
              content: a.content,
              ...(a.content_type ? { content_type: a.content_type } : {}),
            })) }
          : {}),
      }),
    });
    const body = await r.json().catch(() => ({} as any));

    if (!r.ok) {
      console.error('[resend] error', r.status, body);
      await logEmail(admin, {
        template: input.template,
        recipient: input.to,
        subject: input.subject,
        status: 'failed',
        error_message: typeof body === 'object' ? JSON.stringify(body).slice(0, 500) : String(body).slice(0, 500),
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        metadata: input.metadata ?? {},
        triggered_by: input.triggeredBy ?? null,
      });
      return { ok: false, status: r.status, error: 'send failed', details: body };
    }

    await logEmail(admin, {
      template: input.template,
      recipient: input.to,
      subject: input.subject,
      status: 'sent',
      provider_id: body?.id ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
      triggered_by: input.triggeredBy ?? null,
    });

    return { ok: true, status: 200, id: body?.id };
  } catch (e: any) {
    console.error('[sendEmail] exception:', e);
    await logEmail(admin, {
      template: input.template,
      recipient: input.to,
      subject: input.subject,
      status: 'failed',
      error_message: String(e?.message ?? e).slice(0, 500),
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
      triggered_by: input.triggeredBy ?? null,
    });
    return { ok: false, status: 500, error: 'Internal error' };
  }
}

export function brandedShell(opts: {
  title: string;
  bodyHtml: string;
  cardLabel?: string;
  cardValue?: string;
  cardExtra?: string;
}): string {
  return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#f6f5ef;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5ef;padding:32px 0"><tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e4d6">
        <tr><td style="background:linear-gradient(135deg,#1A4A00,#0e2e00);padding:28px;text-align:center;color:#f4e4b2">
          <div style="font-size:13px;letter-spacing:6px;opacity:.7">PALM CHARCOAL</div>
          <div style="font-size:22px;font-weight:700;margin-top:6px">فحم النخلة</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 12px;font-size:22px;color:#1A4A00">${opts.title}</h1>
          ${opts.bodyHtml}
          ${opts.cardLabel ? `<div style="background:#f6f5ef;border-radius:12px;padding:16px;margin:20px 0">
            <div style="font-size:12px;color:#8a8674;letter-spacing:2px;margin-bottom:6px">${opts.cardLabel}</div>
            <div style="font-size:16px;font-weight:600">${opts.cardValue ?? ''}</div>
            ${opts.cardExtra ? `<div style="margin-top:10px;color:#555;font-size:14px">${opts.cardExtra}</div>` : ''}
          </div>` : ''}
          <p style="font-size:13px;color:#888;margin:24px 0 0">للاستفسارات: واتساب 0540060095 · mab355@gmail.com</p>
        </td></tr>
        <tr><td style="background:#0e2e00;color:#bfae74;padding:16px;text-align:center;font-size:11px;letter-spacing:3px">
          © ${new Date().getFullYear()} PALM CHARCOAL · JEDDAH, KSA
        </td></tr>
      </table>
    </td></tr></table></body></html>`;
}

export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
