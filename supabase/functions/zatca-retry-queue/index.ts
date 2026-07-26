// Cron-triggered: retries failed ZATCA submissions (attempts < 5).
// Also re-runs never-submitted invoices whose zatca_status='pending' and status='issued'.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { buildCors } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const cors = buildCors(req, "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const summary: Record<string, unknown> = { retried: 0, queued: 0, errors: [] as string[] };

  // 1) Failed retries
  const { data: failed } = await admin.from("zatca_invoices")
    .select("id, invoice_id, attempts")
    .eq("status", "failed")
    .lt("attempts", 5)
    .limit(20);

  for (const row of failed ?? []) {
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/zatca-sign-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ invoiceId: row.invoice_id }),
      });
      await r.text();
      summary.retried = (summary.retried as number) + 1;
    } catch (e) {
      (summary.errors as string[]).push(String(e?.message ?? e));
    }
  }

  // 2) Never-submitted issued invoices
  const { data: pending } = await admin.from("invoices")
    .select("id")
    .eq("status", "issued")
    .eq("zatca_status", "pending")
    .limit(20);

  for (const row of pending ?? []) {
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/zatca-sign-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ invoiceId: row.id }),
      });
      await r.text();
      summary.queued = (summary.queued as number) + 1;
    } catch (e) {
      (summary.errors as string[]).push(String(e?.message ?? e));
    }
  }

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
