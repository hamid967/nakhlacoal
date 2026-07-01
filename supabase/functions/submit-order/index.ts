// Palm Charcoal — persist a finalized order from the AI assistant
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { checkRateLimit, clientIp } from "../_shared/rate-limit.ts";

const ALLOWED_ORIGINS = new Set<string>([
  "https://nakhlacoal.lovable.app",
  "https://www.alnakhlacoal.com",
  "https://alnakhlacoal.com",
  "https://id-preview--06513aac-9ddf-458b-8161-595178079007.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);

function buildCors(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as Record<string, string>;
}
const MAX_BODY_BYTES = 32_000;

// Durable rate limits live in Postgres via `check_rate_limit` (see _shared/rate-limit.ts).


const OrderSchema = z.object({
  product_type: z.string().trim().min(2).max(80),
  quantity: z.coerce.number().positive().max(100000),
  unit: z.enum(["kg", "carton", "ton", "box"]).default("kg"),
  company_name: z.string().trim().min(2).max(120),
  contact_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^(\+?966|0)?5\d{8}$/, "phone_invalid"),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  business_type: z.string().trim().max(60).optional().or(z.literal("")),
  commercial_register: z.string().trim().max(60).optional().or(z.literal("")),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  notes: z.string().max(800).optional().or(z.literal("")),
  ai_summary: z.string().max(2000).optional().or(z.literal("")),
});

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  // Reject POST with missing or non-allowlisted Origin
  const origin = req.headers.get("Origin") ?? "";
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: "origin_not_allowed" }), {
      status: 403, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Require a valid Bearer token
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.slice(7);
    const anon = createClient(SUPABASE_URL, ANON_KEY);
    const { data: authData, error: authErr } = await anon.auth.getUser(token);
    if (authErr || !authData.user) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId: string = authData.user.id;

    // Durable rate limit: 5 orders/min per user, 10/min per IP.
    const ip = clientIp(req);
    const [userOk, ipOk] = await Promise.all([
      checkRateLimit(`order:user:${userId}`, 5, 60),
      checkRateLimit(`order:ip:${ip}`, 10, 60),
    ]);
    if (!userOk || !ipOk) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    // Read body as bytes and enforce real size (header is spoofable)
    const raw = new Uint8Array(await req.arrayBuffer());
    if (raw.byteLength === 0 || raw.byteLength > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: "payload_too_large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body: unknown;
    try { body = JSON.parse(new TextDecoder().decode(raw)); }
    catch {
      return new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "validation", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const payload = {
      ...parsed.data,
      email: parsed.data.email || null,
      city: parsed.data.city || null,
      address: parsed.data.address || null,
      business_type: parsed.data.business_type || null,
      commercial_register: parsed.data.commercial_register || null,
      delivery_date: parsed.data.delivery_date || null,
      notes: parsed.data.notes || null,
      ai_summary: parsed.data.ai_summary || null,
      user_id: userId,
      status: "new",
    };

    const { data, error } = await admin.from("orders").insert(payload).select("id").single();
    if (error) {
      console.error("[submit-order] insert error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: data.id, ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[submit-order] unhandled error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
