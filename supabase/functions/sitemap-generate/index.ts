// Dynamic sitemap.xml generator — pulls active products + published articles.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const BASE = 'https://nakhlacoal.lovable.app';

const STATIC_ROUTES = [
  '/', '/products', '/catalog', '/quote', '/about', '/contact', '/quality',
  '/export', '/wholesale', '/faq', '/knowledge', '/articles', '/trademarks',
  '/privacy', '/terms', '/refund-policy', '/shipping-policy',
];

Deno.serve(async () => {
  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const [{ data: products }, { data: articles }] = await Promise.all([
      admin.from('products').select('slug, updated_at').eq('is_active', true),
      admin.from('articles').select('slug, updated_at').eq('status', 'published'),
    ]);

    const urls: string[] = [];
    for (const p of STATIC_ROUTES) {
      urls.push(`  <url><loc>${BASE}${p}</loc><changefreq>weekly</changefreq></url>`);
    }
    for (const p of (products ?? []) as { slug: string; updated_at: string }[]) {
      urls.push(`  <url><loc>${BASE}/products/${p.slug}</loc><lastmod>${p.updated_at}</lastmod></url>`);
    }
    for (const a of (articles ?? []) as { slug: string; updated_at: string }[]) {
      urls.push(`  <url><loc>${BASE}/articles/${a.slug}</loc><lastmod>${a.updated_at}</lastmod></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e) {
    return new Response(`<!-- sitemap error: ${e} -->`, { status: 500, headers: { 'Content-Type': 'application/xml' } });
  }
});
