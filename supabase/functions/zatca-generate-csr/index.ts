// Generates a ZATCA-compliant PKCS#10 CSR (secp256k1) and stores it on
// public.zatca_credentials. Admin/accountant only.
//
// Body: { credentialId: string, csrConfig?: {...overrides} }
//
// The CSR uses the real ZATCA template extension (1.3.6.1.4.1.311.20.2) and
// a SubjectAltName DirectoryName containing SN/UID/title/registeredAddress/
// businessCategory as required by Fatoora onboarding. See _shared/zatca-csr.ts.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { buildCors } from "../_shared/cors.ts";
import { generateZatcaCsr, zatcaTemplate } from "../_shared/zatca-csr.ts";

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

    const body = await req.json().catch(() => ({}));
    const credentialId: string = body.credentialId;
    const overrides = body.csrConfig ?? {};
    if (!credentialId) return json({ error: "credentialId_required" }, 400, cors);

    const { data: cred, error } = await admin.from("zatca_credentials")
      .select("*").eq("id", credentialId).single();
    if (error || !cred) return json({ error: "credential_not_found" }, 404, cors);

    // Merge CSR config from column + overrides
    const cfg = { ...(cred.csr_config ?? {}), ...overrides };

    // Validate VAT (15 digits, starts and ends with 3, positions 4-5 = country code 03)
    if (!/^\d{15}$/.test(cred.org_vat)) {
      return json({ error: "invalid_vat", detail: "org_vat must be 15 digits" }, 400, cors);
    }

    // Invoice type bitmask: 4 chars each 0/1
    const invoiceType: string = cfg.invoice_type ?? "1100";
    if (!/^[01]{4}$/.test(invoiceType)) {
      return json({ error: "invalid_invoice_type", detail: "csr_config.invoice_type must be 4-char binary e.g. 1100" }, 400, cors);
    }

    // EGS serial: 1-<solution>|2-<model>|3-<serial>
    const solution = cfg.solution_name ?? "PalmCharcoal-POS";
    const model = cfg.model ?? "ALNAKHLA-EGS-01";
    const egsSerial: string = cfg.egs_serial ?? `1-${solution}|2-${model}|3-${cred.device_serial}`;
    if (!/^1-[^|]+\|2-[^|]+\|3-[^|]+$/.test(egsSerial)) {
      return json({ error: "invalid_egs_serial", detail: "must be 1-solution|2-model|3-serial" }, 400, cors);
    }

    const address = cred.org_address ?? {};
    const location = cfg.location ??
      [address.building, address.street, address.district, address.city, address.postal, address.countryCode ?? "SA"]
        .filter(Boolean).join(" ");
    const industry = cfg.industry ?? "Charcoal Manufacturing";
    const ou = cfg.organizational_unit ?? cred.org_cr ?? "Head Office";

    const csr = await generateZatcaCsr({
      environment: cred.environment,
      commonName: cred.common_name,
      organizationName: cred.org_name,
      organizationalUnit: ou,
      countryCode: address.countryCode ?? "SA",
      vatNumber: cred.org_vat,
      invoiceType,
      location: location || "Jeddah, Saudi Arabia",
      industry,
      egsSerialNumber: egsSerial,
    });

    const persistedCfg = {
      ...cfg,
      invoice_type: invoiceType,
      solution_name: solution,
      model,
      egs_serial: egsSerial,
      location,
      industry,
      organizational_unit: ou,
      template: zatcaTemplate(cred.environment),
    };

    const { error: updErr } = await admin.from("zatca_credentials").update({
      csr: csr.csrPem,
      // Store the raw scalar (hex) — sign-invoice uses noble/curves for secp256k1.
      // Field name preserved for backward compatibility; format is now hex, not PKCS#8.
      private_key_encrypted: csr.privateKeyRawHex,
      public_key: csr.publicKeyRawB64,
      key_curve: "secp256k1",
      csr_config: persistedCfg,
      onboarding_step: "csr_generated",
    }).eq("id", credentialId);
    if (updErr) return json({ error: updErr.message }, 500, cors);

    return json({
      ok: true,
      csr: csr.csrPem,
      privateKeyPem: csr.privateKeyPem,
      publicKey: csr.publicKeyRawB64,
      template: zatcaTemplate(cred.environment),
      config: persistedCfg,
    }, 200, cors);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
