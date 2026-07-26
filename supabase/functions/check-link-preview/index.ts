// Admin-only server-side link preview inspector.
// Fetches the target URL as Facebook/LinkedIn would, parses OG / Twitter /
// canonical / JSON-LD hints, and (optionally) logs the result to
// public.link_preview_checks so the admin has an audit trail.
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { probeMany, type ImageProbeResult } from '../_shared/image-dims.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Well-known UAs so we see exactly what each crawler sees.
const CRAWLER_UAS: Record<string, string> = {
  facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  linkedin: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  twitter:  'Twitterbot/1.0',
  whatsapp: 'WhatsApp/2.23.20.0 A',
  telegram: 'TelegramBot (like TwitterBot)',
  slack:    'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  google:   'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  server:   'PalmCharcoalPreviewChecker/1.0 (+admin-tool)',
};

function pickMeta(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

function parseMeta(html: string) {
  const attr = (name: 'property' | 'name', key: string) =>
    new RegExp(
      `<meta[^>]+${name}=["']${key.replace(/[.*+?^${}()|[\\\]\\\\]/g, '\\\\$&')}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
  const attrRev = (name: 'property' | 'name', key: string) =>
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*${name}=["']${key.replace(/[.*+?^${}()|[\\\]\\\\]/g, '\\\\$&')}["']`,
      'i'
    );

  const link = (rel: string) =>
    new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, 'i');

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;

  return {
    title: titleTag,
    description: pickMeta(html, [attr('name', 'description'), attrRev('name', 'description')]),
    ogTitle: pickMeta(html, [attr('property', 'og:title'), attrRev('property', 'og:title')]),
    ogDescription: pickMeta(html, [attr('property', 'og:description'), attrRev('property', 'og:description')]),
    ogImage: pickMeta(html, [attr('property', 'og:image'), attrRev('property', 'og:image')]),
    ogImageWidth: pickMeta(html, [attr('property', 'og:image:width'), attrRev('property', 'og:image:width')]),
    ogImageHeight: pickMeta(html, [attr('property', 'og:image:height'), attrRev('property', 'og:image:height')]),
    ogUrl: pickMeta(html, [attr('property', 'og:url'), attrRev('property', 'og:url')]),
    ogType: pickMeta(html, [attr('property', 'og:type'), attrRev('property', 'og:type')]),
    twitterCard: pickMeta(html, [attr('name', 'twitter:card'), attrRev('name', 'twitter:card')]),
    twitterImage: pickMeta(html, [attr('name', 'twitter:image'), attrRev('name', 'twitter:image')]),
    twitterTitle: pickMeta(html, [attr('name', 'twitter:title'), attrRev('name', 'twitter:title')]),
    twitterDescription: pickMeta(html, [attr('name', 'twitter:description'), attrRev('name', 'twitter:description')]),
    canonical: pickMeta(html, [link('canonical')]),
  };
}

const EXPECTED_W = 1200;
const EXPECTED_H = 630;

function warnForImage(
  label: 'og:image' | 'twitter:image',
  url: string | null | undefined,
  declaredW: string | null | undefined,
  declaredH: string | null | undefined,
  probes: Record<string, ImageProbeResult>,
): { warnings: string[]; probe: ImageProbeResult | null } {
  const out: string[] = [];
  if (!url) return { warnings: out, probe: null };
  const probe = probes[url] ?? null;
  if (!probe) return { warnings: out, probe: null };
  if (!probe.ok) {
    out.push(`${label} تعذّر جلبه (${probe.error}${probe.httpStatus ? ` — HTTP ${probe.httpStatus}` : ''})`);
    return { warnings: out, probe };
  }
  const { width, height, bytes, format, contentType } = probe.dims;
  if (width !== EXPECTED_W || height !== EXPECTED_H) {
    out.push(`${label} أبعاده الفعلية ${width}×${height} (المتوقع ${EXPECTED_W}×${EXPECTED_H})`);
  }
  if (declaredW && Number(declaredW) !== width) {
    out.push(`${label}:width المُعلَن ${declaredW} لا يطابق الفعلي ${width}`);
  }
  if (declaredH && Number(declaredH) !== height) {
    out.push(`${label}:height المُعلَن ${declaredH} لا يطابق الفعلي ${height}`);
  }
  if (bytes > 5 * 1024 * 1024) {
    out.push(`${label} أكبر من 5MB (${Math.round(bytes / 1024)}KB) — قد ترفضه بعض المنصات`);
  }
  // Sanity: file format usually implied by URL extension — warn on mismatch that will confuse crawlers.
  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    out.push(`${label} Content-Type غير صحيح (${contentType}) — يجب أن يبدأ بـ image/`);
  }
  void format;
  return { warnings: out, probe };
}

function computeWarnings(meta: ReturnType<typeof parseMeta>, probes: Record<string, ImageProbeResult> = {}) {
  const warnings: string[] = [];
  if (!meta.ogTitle) warnings.push('og:title مفقود');
  if (!meta.ogDescription) warnings.push('og:description مفقود');
  if (!meta.ogImage) warnings.push('og:image مفقود');
  if (meta.ogImage && !/^https:\/\//i.test(meta.ogImage)) warnings.push('og:image ليس مساراً مطلقاً https');
  if (!meta.twitterCard) warnings.push('twitter:card مفقود');
  else if (meta.twitterCard !== 'summary_large_image') warnings.push(`twitter:card = ${meta.twitterCard} (المتوقع summary_large_image)`);
  if (!meta.twitterImage) warnings.push('twitter:image مفقود');
  if (meta.ogImage && meta.twitterImage && meta.ogImage !== meta.twitterImage) {
    warnings.push('og:image لا يطابق twitter:image');
  }
  // Real-dimension warnings (falls back silently if the image couldn't be probed).
  warnings.push(
    ...warnForImage('og:image', meta.ogImage, meta.ogImageWidth, meta.ogImageHeight, probes).warnings,
  );
  if (meta.twitterImage && meta.twitterImage !== meta.ogImage) {
    warnings.push(...warnForImage('twitter:image', meta.twitterImage, null, null, probes).warnings);
  }
  if (!meta.canonical) warnings.push('canonical مفقود');
  return warnings;
}

// Debugger URL builders (for the client to open in a new tab).
export const DEBUGGER_URLS: Record<string, (u: string) => string> = {
  facebook: (u) => `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(u)}`,
  linkedin: (u) => `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(u)}`,
  twitter:  (u) => `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(u)}`,
  whatsapp: (u) => `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(u)}`,
  telegram: (u) => `https://t.me/webpagebot?start=${encodeURIComponent(u)}`,
  google:   (u) => `https://search.google.com/test/rich-results?url=${encodeURIComponent(u)}`,
};

Deno.serve(async (req) => {
  const cors = buildCors(req, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // Auth + admin gate (verify_jwt = true by default → JWT is trusted).
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  const { data: hasAdmin } = await admin.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
  if (!hasAdmin) {
    return new Response(JSON.stringify({ ok: false, error: 'forbidden' }), {
      status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body: { url?: string; ua?: string; log?: boolean; note?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const target = String(body.url ?? '').trim();
  const uaKey = String(body.ua ?? 'facebook').toLowerCase();
  const shouldLog = body.log !== false;

  if (!/^https?:\/\/[^\s]+$/i.test(target)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_url' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  const ua = CRAWLER_UAS[uaKey] ?? CRAWLER_UAS.server;

  const started = Date.now();
  let httpStatus = 0;
  let html = '';
  let fetchError: string | null = null;
  try {
    const resp = await fetch(target, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    httpStatus = resp.status;
    html = await resp.text();
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
  }

  const meta = html ? parseMeta(html) : null;
  const probes = meta ? await probeMany([meta.ogImage, meta.twitterImage], ua) : {};
  const warnings = meta ? computeWarnings(meta, probes) : ['فشل جلب الصفحة'];
  const status = fetchError || httpStatus >= 400 ? 'error' : warnings.length ? 'warn' : 'ok';

  // Attach probe summaries so the client + audit log get the real dims.
  const imageProbes = Object.fromEntries(
    Object.entries(probes).map(([u, p]) => [u, p.ok ? { width: p.dims.width, height: p.dims.height, format: p.dims.format, bytes: p.dims.bytes, contentType: p.dims.contentType } : { error: p.error, httpStatus: p.httpStatus ?? null }]),
  );
  const metaWithProbes = meta ? { ...meta, imageProbes } : null;

  // Log
  if (shouldLog) {
    await admin.from('link_preview_checks').insert({
      url: target,
      tool: uaKey,
      status,
      http_status: httpStatus || null,
      og_title: meta?.ogTitle ?? null,
      og_description: meta?.ogDescription ?? null,
      og_image: meta?.ogImage ?? null,
      og_url: meta?.ogUrl ?? null,
      og_type: meta?.ogType ?? null,
      twitter_card: meta?.twitterCard ?? null,
      twitter_image: meta?.twitterImage ?? null,
      canonical: meta?.canonical ?? null,
      warnings,
      raw: metaWithProbes,
      note: body.note ?? null,
      checked_by: userData.user.id,
    });
  }

  return new Response(JSON.stringify({
    ok: !fetchError,
    url: target,
    ua: uaKey,
    userAgent: ua,
    httpStatus,
    durationMs: Date.now() - started,
    status,
    warnings,
    meta: metaWithProbes,
    fetchError,
    debuggerUrls: Object.fromEntries(
      Object.entries(DEBUGGER_URLS).map(([k, fn]) => [k, fn(target)])
    ),
  }), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
