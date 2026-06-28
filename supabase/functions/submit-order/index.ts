// Palm Charcoal — persist a finalized order from the AI assistant
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OrderSchema = z.object({
  product_type: z.string().trim().min(2).max(80),
  quantity: z.coerce.number().positive().max(100000),
  unit: z.enum(["kg", "carton", "ton"]).default("kg"),
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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "validation", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: capture user_id if signed-in
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const anon = createClient(SUPABASE_URL, ANON_KEY);
      const { data } = await anon.auth.getClaims(authHeader.slice(7));
      userId = data?.claims?.sub ?? null;
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
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: data.id, ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
