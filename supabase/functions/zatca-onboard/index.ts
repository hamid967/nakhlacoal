// ZATCA onboarding: submits the CSR to Fatoora and stores Compliance/Production CSID.
//
// Body:
//   { credentialId: string, step: 'compliance' | 'production', otp?: string, complianceRequestId?: string }
//
// - step='compliance': posts CSR to /compliance with OTP → returns Compliance CSID + request_id.
// - step='production': posts complianceRequestId to /production/csids → returns Production CSID.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { buildCors } from "../_shared/cors.ts";
import { zatcaBase } from "../_shared/zatca.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const cors = buildCors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401, cors);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return json({ error: "unauthorized" }, 401, cors);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userRes.user.id);
    const allowed = new Set(["admin", "super_admin", "accountant"]);
    if (!(roles ?? []).some((r) => allowed.has(r.role as string))) {
      return json({ error: "forbidden" }, 403, cors);
    }

    const { credentialId, step, otp } = await req.json();
    if (!credentialId || !step) return json({ error: "invalid_body" }, 400, cors);

    const { data: cred, error } = await admin.from("zatca_credentials").select("*").eq("id", credentialId).single();
    if (error || !cred) return json({ error: "credential_not_found" }, 404, cors);

    const base = zatcaBase(cred.environment);

    if (step === "compliance") {
      if (!cred.csr) return json({ error: "csr_missing" }, 400, cors);
      if (!otp) return json({ error: "otp_required" }, 400, cors);

      // Strip PEM headers, keep the base64 body
      const csrBody = cred.csr
        .replace(/-----BEGIN CERTIFICATE REQUEST-----/g, "")
        .replace(/-----END CERTIFICATE REQUEST-----/g, "")
        .replace(/\s+/g, "");

      const res = await fetch(`${base}/compliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Version": "V2",
          "OTP": otp,
        },
        body: JSON.stringify({ csr: csrBody }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        return json({ error: "zatca_compliance_failed", status: res.status, body }, 502, cors);
      }
      await admin.from("zatca_credentials").update({
        compliance_csid: body.binarySecurityToken ?? null,
        compliance_request_id: body.requestID?.toString() ?? null,
        onboarding_step: "compliance_ready",
      }).eq("id", credentialId);
      return json({ ok: true, requestId: body.requestID, csid: body.binarySecurityToken }, 200, cors);
    }

    if (step === "production") {
      if (!cred.compliance_request_id) return json({ error: "compliance_first" }, 400, cors);
      const res = await fetch(`${base}/production/csids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Version": "V2",
          "Authorization": `Basic ${btoa(`${cred.compliance_csid}:${cred.compliance_request_id}`)}`,
        },
        body: JSON.stringify({ compliance_request_id: cred.compliance_request_id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        return json({ error: "zatca_production_failed", status: res.status, body }, 502, cors);
      }
      await admin.from("zatca_credentials").update({
        production_csid: body.binarySecurityToken ?? null,
        onboarding_step: "production_ready",
        active: true,
      }).eq("id", credentialId);
      return json({ ok: true, csid: body.binarySecurityToken }, 200, cors);
    }

    return json({ error: "invalid_step" }, 400, cors);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
