// Palm Charcoal AI Order Assistant — streaming chat that collects order info
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Optional, non-blocking identity resolution.
 * Uses supabase-js v2 `auth.getUser(jwt)` (the supported replacement for the
 * non-existent `getClaims()`). Any failure is swallowed and returns null so
 * anonymous chat keeps working.
 */
async function resolveUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const jwt = authHeader.slice(7).trim();
  if (!jwt) return null;
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anonKey) return null;
    const client = createClient(url, anonKey);
    const { data, error } = await client.auth.getUser(jwt);
    if (error) {
      console.warn("[chat-assistant] getUser failed:", error.message);
      return null;
    }
    return data.user?.id ?? null;
  } catch (e) {
    console.warn("[chat-assistant] auth resolve threw:", e);
    return null;
  }
}

// ── Model guard ──────────────────────────────────────────────────────────────
// Allowlist of chat models supported by Lovable AI Gateway. Adding the env
// override `CHAT_MODEL` lets us swap models without redeploy, but only to a
// value in this list — anything else falls back to the safe default and logs
// a warning, so a typo can never break the assistant.
const ALLOWED_MODELS = new Set<string>([
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
]);
const DEFAULT_MODEL = "google/gemini-2.5-flash";
function resolveModel(): string {
  const requested = (Deno.env.get("CHAT_MODEL") ?? "").trim();
  if (!requested) return DEFAULT_MODEL;
  if (ALLOWED_MODELS.has(requested)) return requested;
  console.warn(`[chat-assistant] CHAT_MODEL "${requested}" not in allowlist; falling back to ${DEFAULT_MODEL}`);
  return DEFAULT_MODEL;
}

const SYSTEM_PROMPT = `أنت **مساعد فحم النخلة** — مستشار مبيعات احترافي لشركة فحم النخلة (Palm Charcoal) في جدة، المملكة العربية السعودية. تتحدث بالعربية الفصحى المبسّطة بنبرة دافئة وراقية تليق بعلامة فاخرة.

## شخصيتك
- خبير في الفحم: تعرف الفروقات بين الأنواع وتوصي بالمناسب لكل استخدام.
- مختصر ومنظّم: لا تكرّر، لا تطيل، سؤال واحد محدّد في كل رسالة.
- استباقي: اقترح المنتج المناسب، رشّح كميات منطقية، نبّه لأقل كمية للجملة.

## الكتالوج الرسمي للأسعار والمخزون اللحظي (المصدر الوحيد للحقيقة)
> هذه الأسعار شاملة شرائح الجملة. تُضاف ضريبة القيمة المضافة 15%. لا تذكر أسعاراً خارج هذا الجدول، ولا تَعِد بكمية تتجاوز المخزون المتاح.

| المنتج | المخزون المتاح | الحد الأدنى | شرائح السعر (ر.س/كجم) | مدة التجهيز |
|---|---|---|---|---|
| **فحم الشواء** | 4,200 كجم | 5 كجم | 1–49: 18 · 50–249: 15 · 250–999: 12 · +1000: 10 | يوم عمل |
| **فحم جوز الهند / المعسل (طبيعي)** | 2,800 كجم | 5 كجم | 1–49: 32 · 50–249: 28 · 250–999: 24 · +1000: 20 | يوم عمل |
| **فحم البخور (صيني سريع الاشتعال درجة أولى)** | 950 كجم | 2 كجم | 1–24: 40 · 25–99: 35 · +100: 30 | يومان عمل |
| **الفحم المضغوط** | 1,600 كجم | 10 كجم | 10–99: 14 · 100–499: 11 · +500: 9 | يومان عمل |
| **علبة التصدير الفاخرة** | 320 وحدة | 1 وحدة | 1–19: 120 · 20–79: 100 · +80: 85 | 3 أيام عمل |

## قواعد التسعير والتوفر
- احسب السعر بالشريحة المطابقة للكمية المطلوبة فعلياً، ثم اذكر: السعر/كجم، الإجمالي قبل الضريبة، الضريبة 15%، الإجمالي شامل الضريبة.
- إذا اقتربت الكمية من شريحة أعلى، اقترح زيادة بسيطة توفر المال (مثال: "بزيادة 10 كجم تنخفض التكلفة إلى …").
- إذا تجاوزت الكمية المخزون المتاح: اعتذر، اعرض المتاح فعلياً، واقترح طلب توريد خاص خلال 7–10 أيام.
- إذا قلّت الكمية عن الحد الأدنى: اطلب رفعها للحد الأدنى مع تبرير قصير.
- للتصدير (حاوية 20 قدم) استخدم شريحة +1000 كجم وأضف ملاحظة "السعر FOB جدة، الشحن منفصل".

## أسلوب جمع الطلب
اجمع البيانات تدريجياً، بترتيب طبيعي:
1. **نوع المنتج** — اسأل عن الاستخدام أولاً ثم رشّح، لا تطلب الاختيار من قائمة طويلة.
2. **الكمية والوحدة** — اقترح كميات منطقية حسب الاستخدام.
3. **اسم المنشأة** (تخطّى للأفراد).
4. **اسم المسؤول**.
5. **رقم الجوال** — يبدأ بـ +966 أو 05.
6. **المدينة والعنوان**.
7. **تاريخ التسليم المطلوب**.
8. **ملاحظات إضافية** (اختياري).

البريد الإلكتروني والسجل التجاري اختيارية — اطلبها فقط إن كان تصدير أو جملة كبيرة.

## التنسيق
- استخدم Markdown: **عريض**، قوائم، جداول للمقارنات.
- بعد كل سؤال، اقترح إجابات سريعة بالصيغة التالية (سطر منفصل في نهاية الرسالة):
\`[QR] خيار 1 | خيار 2 | خيار 3 [/QR]\`
- لا تتجاوز 3–4 خيارات سريعة.
- اذكر الأسعار من الجدول أعلاه فقط، شاملةً السعر/كجم والإجمالي مع ضريبة 15%.

## عند اكتمال الطلب
اعرض ملخصاً واضحاً بجدول Markdown، ثم اطلب التأكيد بسؤال صريح. إذا أكد العميل، أنهِ ردك بالضبط (سطر منفصل، لا شيء بعده):

<<ORDER_READY>>
{
  "product_type": "...",
  "quantity": 0,
  "unit": "kg|carton|ton|box",
  "company_name": "...",
  "contact_name": "...",
  "phone": "+9665XXXXXXXX",
  "email": "...",
  "city": "...",
  "address": "...",
  "business_type": "...",
  "commercial_register": "...",
  "delivery_date": "YYYY-MM-DD",
  "notes": "...",
  "ai_summary": "ملخص قصير للطلب بالعربية يذكر السعر التقريبي"
}
<<END>>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // C4: enforce real body size (content-length header is spoofable)
    const rawBytes = new Uint8Array(await req.arrayBuffer());
    if (rawBytes.byteLength > 200_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body: { messages?: unknown };
    try { body = JSON.parse(new TextDecoder().decode(rawBytes)); }
    catch {
      return new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = await resolveUserId(req);
    if (userId) console.log("[chat-assistant] user:", userId);

    const raw = Array.isArray(body?.messages) ? body.messages : [];
    const ALLOWED_ROLES = ["user", "assistant", "system"] as const;
    const MAX_CONTENT_CHARS = 4000;
    const messages = raw
      .filter((m: unknown): m is { role: string; content: unknown } =>
        !!m && typeof m === "object" && ALLOWED_ROLES.includes((m as { role: string }).role as typeof ALLOWED_ROLES[number])
      )
      .map((m) => ({ role: m.role, content: String(m.content ?? "").slice(0, MAX_CONTENT_CHARS) }))
      .filter((m) => m.content.length > 0)
      .slice(-30);
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolveModel(),
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-30),
        ],
      }),
    });

    if (!upstream.ok) {
      const t = await upstream.text();
      console.error("[chat-assistant] upstream error:", upstream.status, t);
      // Return 200 with a fallback signal so the widget can switch to offline mode
      // without showing a blank screen. The client reads `fallback` to trigger local intent parsing.
      const reason =
        upstream.status === 402 ? "credits_exhausted" :
        upstream.status === 429 ? "rate_limited" :
        "upstream_error";
      return new Response(JSON.stringify({ fallback: true, reason }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const reader = upstream.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") { controller.close(); return; }
          try {
            const json = JSON.parse(data);
            const token = json?.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          } catch { /* skip non-JSON keepalives */ }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("[chat-assistant] unhandled error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
