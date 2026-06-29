// Palm Charcoal AI Order Assistant — streaming chat that collects order info
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
- إذا ذكرت سعراً، اذكره كتقدير وأضف: "السعر النهائي بعد تأكيد المواصفات."

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

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > 200_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
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
        model: "google/gemini-3-flash-preview",
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
      const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 500;
      const msg = status === 429 ? "Rate limited" : status === 402 ? "AI credits exhausted" : "Upstream error";
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
