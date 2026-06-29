// Palm Charcoal — AI Product Recommender
// Returns a structured recommendation { slug, reason, quantitySuggestion }
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRODUCTS = [
  { slug: "bbq", ar: "فحم الشواء", en: "BBQ Charcoal", best: "home grilling, family BBQ, outdoor trips" },
  { slug: "coconut", ar: "فحم جوز الهند", en: "Coconut Charcoal", best: "premium restaurants, eco-conscious, long burn" },
  { slug: "hookah", ar: "فحم المعسل (جوز هند طبيعي)", en: "Hookah Charcoal", best: "shisha lounges, cafés, premium home shisha" },
  { slug: "incense", ar: "فحم البخور", en: "Incense Charcoal", best: "majlis, mosques, oud and bukhoor daily use" },
  { slug: "compressed", ar: "الفحم المضغوط", en: "Compressed Charcoal", best: "hotels, heavy commercial restaurant use, long burn" },
  { slug: "export", ar: "علبة التصدير الفاخرة", en: "Premium Export Box", best: "international export, private label, luxury retail" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, lang = "ar" } = await req.json();
    if (!query || typeof query !== "string" || query.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid query" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const catalog = PRODUCTS.map((p) => `- ${p.slug}: ${p.ar} / ${p.en} — best for: ${p.best}`).join("\n");
    const system = `You are a Palm Charcoal product advisor. Match the customer need to ONE product from the catalog below. Respond in ${lang === "ar" ? "Arabic" : "English"}.\n\nCatalog:\n${catalog}`;

    const tool = {
      type: "function",
      function: {
        name: "recommend",
        description: "Return the top 3 product recommendations ranked best to good.",
        parameters: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  slug: { type: "string", enum: PRODUCTS.map((p) => p.slug) },
                  reason: { type: "string", description: "One short sentence (max ~20 words) in the user's language." },
                  quantitySuggestion: { type: "string", description: "Suggested starting quantity, e.g. '10 kg' or '50 kg'." },
                },
                required: ["slug", "reason", "quantitySuggestion"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    };


    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: query },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "recommend" } },
      }),
    });

    if (aiRes.status === 429 || aiRes.status === 402) {
      return new Response(
        JSON.stringify({
          fallback: true,
          reason: aiRes.status === 402 ? "credits_exhausted" : "rate_limited",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI error", detail: text.slice(0, 300) }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiRes.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return new Response(JSON.stringify({ fallback: true, reason: "no_tool_call" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const args = JSON.parse(call.function.arguments);

    return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[recommend-product] unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
