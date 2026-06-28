// Palm Charcoal AI Order Assistant — streaming chat that collects order info
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `أنت "مساعد فحم النخلة" — مساعد مبيعات ذكي لشركة فحم النخلة (Palm Charcoal) في جدة. مهمتك جمع بيانات طلب الفحم من العميل بطريقة احترافية وودودة باللغة العربية.

اجمع البيانات التالية واحدة تلو الأخرى (لا تطلبها كلها دفعة واحدة):
1. نوع الفحم المطلوب (الخيارات: فحم شواء، فحم جوز الهند، فحم شيشة، فحم خشب، صناديق هدايا — اقترح المناسب حسب الاستخدام)
2. الكمية والوحدة (كرتون، كيلو، طن)
3. اسم المنشأة/الشركة
4. اسم المسؤول
5. رقم الجوال (يجب أن يبدأ بـ +966 أو 05)
6. البريد الإلكتروني (اختياري)
7. المدينة والعنوان
8. نوع النشاط (مطعم، مقهى، تصدير، جملة، خاص)
9. السجل التجاري (اختياري للأنشطة التجارية)
10. تاريخ التسليم المطلوب

كن مختصراً ومنظماً. استخدم Markdown للتنسيق (قوائم، **عريض**). اسأل سؤالاً واحداً في كل رسالة.

عند اكتمال جميع البيانات الإلزامية، اعرض ملخصاً واضحاً للطلب باستخدام جدول Markdown، ثم اطلب التأكيد. إذا أكد العميل، أرسل في نهاية ردك بالضبط (وعلى سطر منفصل، بدون أي شيء بعده):

<<ORDER_READY>>
{
  "product_type": "...",
  "quantity": 0,
  "unit": "kg|carton|ton",
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
  "ai_summary": "ملخص قصير للطلب بالعربية"
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

    // Reject obviously oversized payloads up front
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

    // Transform SSE chunks → simple text stream of delta tokens
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
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
