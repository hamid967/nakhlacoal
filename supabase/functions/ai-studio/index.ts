// Lovable AI Studio: generates marketing intro copy and an image
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req, "POST, OPTIONS");
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require authenticated user — AI calls are costly
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anon = createClient(SUPABASE_URL, ANON_KEY);
    const token = authHeader.slice(7);
    const { data: claimsData, error: claimsErr } = await anon.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, prompt } = await req.json();
    const userPrompt = (prompt ?? "").toString().slice(0, 1000);

    if (mode === "image") {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: `Cinematic luxury marketing image for Palm Charcoal — premium Saudi date-palm charcoal brand. Matte black + warm gold ember tones, dramatic lighting, editorial composition. Concept: ${userPrompt}`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("[ai-studio] image gen failed:", r.status, t);
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await r.json();
      // Lovable AI returns image as data URL in choices[0].message.images[0].image_url.url
      const url =
        data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ??
        (data?.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);
      return new Response(JSON.stringify({ image: url }), {
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
      console.error("[ai-studio] text gen failed:", r.status, t);
      return new Response(JSON.stringify({ error: "Text generation failed" }), {
        status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[ai-studio] unhandled error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
