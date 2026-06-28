// Lovable AI Studio: generates marketing intro copy and an image
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, prompt } = await req.json();
    const userPrompt = (prompt ?? "").toString().slice(0, 1000);

    if (mode === "image") {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          prompt: `Cinematic luxury marketing image for Palm Charcoal — premium Saudi date-palm charcoal brand. Matte black + warm gold ember tones, dramatic lighting, editorial composition. Concept: ${userPrompt}`,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        return new Response(JSON.stringify({ error: t }), {
          status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await r.json();
      const b64 = data?.data?.[0]?.b64_json;
      return new Response(JSON.stringify({ image: b64 ? `data:image/png;base64,${b64}` : null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // mode === "intro": generate intro copy + a short video concept
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are the creative director for فحم النخلة (Palm Charcoal), a premium Saudi date-palm charcoal brand. Write in cinematic, luxury, editorial English. Be concise and evocative.",
          },
          {
            role: "user",
            content: `Produce two outputs for: "${userPrompt}".\n\n1) HEADLINE (max 8 words)\n2) INTRO PARAGRAPH (50-70 words)\n3) 15-SECOND VIDEO CONCEPT — 4 shot list bullets, each with camera move + subject + lighting.\n\nFormat with the labels HEADLINE, INTRO, and VIDEO exactly.`,
          },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: t }), {
        status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
