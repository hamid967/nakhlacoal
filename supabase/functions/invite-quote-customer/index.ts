// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BodySchema = z.object({ quoteId: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { quoteId } = parsed.data;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // 1. Load quote
    const { data: quote, error: qErr } = await admin
      .from("quote_requests")
      .select("*")
      .eq("id", quoteId)
      .maybeSingle();
    if (qErr) throw qErr;
    if (!quote) return json({ error: "quote_not_found" }, 404);
    if (quote.status !== "accepted") return json({ skipped: "not_accepted" }, 200);
    if (!quote.email) return json({ skipped: "no_email" }, 200);
    if (quote.invited_at) return json({ skipped: "already_invited" }, 200);

    const email = String(quote.email).trim().toLowerCase();
    const origin = req.headers.get("origin") ?? "https://alnakhlacoal.com";
    const redirectTo = `${origin}/reset-password`;

    // 2. Find existing auth user by email
    let userId: string | null = null;
    try {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users?.find((u: any) => (u.email || "").toLowerCase() === email);
      if (found) userId = found.id;
    } catch (_) { /* ignore */ }

    let invited = false;
    if (!userId) {
      // 3a. Invite new user (sends Supabase auth invite email with password-set link)
      const { data: inv, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: {
          full_name: quote.contact_name ?? "",
          phone: quote.phone ?? "",
          company_name: quote.company_name ?? "",
        },
      });
      if (invErr) throw invErr;
      userId = inv.user?.id ?? null;
      invited = true;
    } else {
      // 3b. Existing user → send password recovery link
      await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      }).catch(() => null);
    }

    // 4. Upsert customer record
    let customerId: string | null = quote.customer_id ?? null;
    if (!customerId) {
      const { data: existingCust } = await admin
        .from("customers")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (existingCust) customerId = existingCust.id;
      else {
        const { data: newCust, error: cErr } = await admin
          .from("customers")
          .insert({
            owner_user_id: userId,
            company_name: quote.company_name ?? quote.contact_name ?? email,
            contact_name: quote.contact_name,
            phone: quote.phone,
            email,
            city: quote.destination,
            notes: `Auto-created from quote ${quoteId}`,
          })
          .select("id")
          .single();
        if (cErr) throw cErr;
        customerId = newCust.id;
      }
    }

    // 5. Link quote → user + customer, mark invited
    await admin
      .from("quote_requests")
      .update({
        user_id: userId,
        customer_id: customerId,
        invited_at: new Date().toISOString(),
      })
      .eq("id", quoteId);

    // 6. Best-effort notification log
    await admin.from("notifications").insert({
      type: invited ? "customer_invited" : "customer_recovery_sent",
      title: invited ? "دعوة عميل جديد" : "إعادة تعيين كلمة المرور",
      body: `تم ${invited ? "إرسال دعوة تفعيل الحساب" : "إرسال رابط تعيين كلمة المرور"} إلى ${email}`,
      metadata: { quoteId, email, userId, customerId },
    }).select().maybeSingle().then(() => null).catch(() => null);

    return json({ ok: true, userId, customerId, invited }, 200);
  } catch (e: any) {
    console.error("[invite-quote-customer]", e?.message ?? e);
    return json({ error: e?.message ?? "unexpected_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
