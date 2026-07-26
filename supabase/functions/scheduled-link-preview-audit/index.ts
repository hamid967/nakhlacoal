// Scheduled bi-weekly audit of every URL in sitemap.xml.
// Invoked by pg_cron via pg_net; authorized with a shared secret header
// (SCHEDULED_AUDIT_TOKEN) or the Supabase service role JWT.
// For each URL: fetch as the Facebook crawler, parse OG / Twitter / canonical
// meta, and insert a row into public.link_preview_checks with
// source='scheduled' and a shared batch_id so the run is groupable by date.

import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { probeMany, type ImageProbeResult } from '../_shared/image-dims.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SHARED_TOKEN = Deno.env.get('SCHEDULED_AUDIT_TOKEN') ?? '';

const DEFAULT_SITEMAP = 'https://alnakhlacoal.com/sitemap.xml';
const DEFAULT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
// Cap concurrent fetches so we don't hammer the origin.
const CONCURRENCY = 4;

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
      `<meta[^>]+${name}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*content=["']([^"']*)["']`,
      'i',
    );
  const attrRev = (name: 'property' | 'name', key: string) =>
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*${name}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
      'i',
    );
  const link = (rel: string) =>
    new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, 'i');

  return {
    title: html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null,
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

function computeWarnings(meta: ReturnType<typeof parseMeta>) {
  const w: string[] = [];
  if (!meta.ogTitle) w.push('og:title مفقود');
  if (!meta.ogDescription) w.push('og:description مفقود');
  if (!meta.ogImage) w.push('og:image مفقود');
  if (meta.ogImage && !/^https:\/\//i.test(meta.ogImage)) w.push('og:image ليس مساراً مطلقاً https');
  if (!meta.twitterCard) w.push('twitter:card مفقود');
  else if (meta.twitterCard !== 'summary_large_image') w.push(`twitter:card = ${meta.twitterCard} (المتوقع summary_large_image)`);
  if (!meta.twitterImage) w.push('twitter:image مفقود');
  if (meta.ogImage && meta.twitterImage && meta.ogImage !== meta.twitterImage) w.push('og:image لا يطابق twitter:image');
  if (meta.ogImageWidth && meta.ogImageWidth !== '1200') w.push(`og:image:width = ${meta.ogImageWidth} (المتوقع 1200)`);
  if (meta.ogImageHeight && meta.ogImageHeight !== '630') w.push(`og:image:height = ${meta.ogImageHeight} (المتوقع 630)`);
  if (!meta.canonical) w.push('canonical مفقود');
  return w;
}

function extractSitemapUrls(xml: string): string[] {
  const urls = new Set<string>();
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const u = m[1].trim();
    if (/^https?:\/\//i.test(u) && !u.endsWith('.xml')) urls.add(u);
  }
  return [...urls];
}

async function checkOne(url: string) {
  const started = Date.now();
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': DEFAULT_UA, 'Accept': 'text/html,application/xhtml+xml' },
      redirect: 'follow',
    });
    const html = await resp.text();
    const meta = parseMeta(html);
    const warnings = computeWarnings(meta);
    const status = resp.status >= 400 ? 'error' : warnings.length ? 'warn' : 'ok';
    return { url, httpStatus: resp.status, meta, warnings, status, durationMs: Date.now() - started, fetchError: null as string | null };
  } catch (err) {
    return {
      url,
      httpStatus: 0,
      meta: null as ReturnType<typeof parseMeta> | null,
      warnings: ['فشل جلب الصفحة'],
      status: 'error' as const,
      durationMs: Date.now() - started,
      fetchError: err instanceof Error ? err.message : String(err),
    };
  }
}

async function runInPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

Deno.serve(async (req) => {
  const cors = buildCors(req, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // Authorize: shared token header OR admin JWT.
  const provided = req.headers.get('x-audit-token') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  let authorized = false;
  if (SHARED_TOKEN && provided && provided === SHARED_TOKEN) {
    authorized = true;
  } else if (jwt && jwt === SERVICE_ROLE) {
    // pg_cron / server-to-server invocation using the service role key.
    authorized = true;
  } else if (jwt) {
    const { data: userData } = await admin.auth.getUser(jwt);
    if (userData?.user) {
      const { data: hasAdmin } = await admin.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
      if (hasAdmin) authorized = true;
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body: { sitemap?: string; urls?: string[]; source?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const sitemapUrl = body.sitemap && /^https?:\/\//i.test(body.sitemap) ? body.sitemap : DEFAULT_SITEMAP;
  const source = body.source ?? 'scheduled';

  // Resolve URL list: explicit override wins, else parse sitemap.
  let urls: string[] = [];
  if (Array.isArray(body.urls) && body.urls.length) {
    urls = body.urls.filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u));
  } else {
    try {
      const resp = await fetch(sitemapUrl, { headers: { 'User-Agent': 'PalmCharcoalScheduledAudit/1.0' } });
      if (!resp.ok) {
        return new Response(JSON.stringify({ ok: false, error: 'sitemap_fetch_failed', status: resp.status }), {
          status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      urls = extractSitemapUrls(await resp.text());
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: 'sitemap_fetch_error', details: String(err) }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  }

  if (!urls.length) {
    return new Response(JSON.stringify({ ok: false, error: 'no_urls' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const batchId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const results = await runInPool(urls, CONCURRENCY, checkOne);

  const rows = results.map((r) => ({
    url: r.url,
    tool: 'facebook',
    status: r.status,
    http_status: r.httpStatus || null,
    og_title: r.meta?.ogTitle ?? null,
    og_description: r.meta?.ogDescription ?? null,
    og_image: r.meta?.ogImage ?? null,
    og_url: r.meta?.ogUrl ?? null,
    og_type: r.meta?.ogType ?? null,
    twitter_card: r.meta?.twitterCard ?? null,
    twitter_image: r.meta?.twitterImage ?? null,
    canonical: r.meta?.canonical ?? null,
    warnings: r.warnings,
    raw: r.meta,
    note: `scheduled audit @ ${startedAt}`,
    source,
    batch_id: batchId,
  }));

  const { error: insertErr } = await admin.from('link_preview_checks').insert(rows);
  if (insertErr) {
    console.error('scheduled-link-preview-audit insert failed', insertErr);
    return new Response(JSON.stringify({ ok: false, error: 'insert_failed', details: insertErr.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const summary = {
    ok: 0,
    warn: 0,
    error: 0,
  } as Record<'ok' | 'warn' | 'error', number>;
  for (const r of results) summary[r.status as 'ok' | 'warn' | 'error']++;

  return new Response(JSON.stringify({
    ok: true,
    batchId,
    startedAt,
    sitemap: sitemapUrl,
    totalUrls: urls.length,
    summary,
  }), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
