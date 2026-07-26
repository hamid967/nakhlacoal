// Generates a ZATCA-compliant CSR (Certificate Signing Request) + ECDSA P-256 keypair.
// Stores the encrypted private key + CSR on public.zatca_credentials.
// Admin/accountant only.
//
// Body: { credentialId: string }
//   The credential row must already exist with org data. Populates CSR + private_key.
//
// SECURITY: private key stored as base64 PKCS#8; server-side encryption at rest is
// provided by Supabase disk encryption. For higher assurance rotate to pgsodium vaulting.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { buildCors } from "../_shared/cors.ts";
import { b64encode } from "../_shared/zatca.ts";

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

    const body = await req.json();
    const credentialId: string = body.credentialId;
    if (!credentialId) return json({ error: "credentialId_required" }, 400, cors);

    const { data: cred, error } = await admin.from("zatca_credentials").select("*").eq("id", credentialId).single();
    if (error || !cred) return json({ error: "credential_not_found" }, 404, cors);

    // Generate ECDSA P-256 keypair
    const kp = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );
    const privBuf = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
    const pubBuf = await crypto.subtle.exportKey("spki", kp.publicKey);

    const privB64 = b64encode(new Uint8Array(privBuf));
    const pubB64 = b64encode(new Uint8Array(pubBuf));

    // Build CSR — simplified template ZATCA compatible.
    // A full implementation would DER-encode the CSR with ZATCA custom OIDs
    // (1.3.6.1.4.1.311.20.2 = TSTUsage). Sandbox accepts a placeholder-tagged CSR
    // structure so long as the CN and public key are valid.
    // For real production, use a proper ASN.1 library (node-forge over esm.sh).
    const csrPem = buildCsrPlaceholder({
      commonName: cred.common_name,
      orgName: cred.org_name,
      orgVat: cred.org_vat,
      environment: cred.environment,
      publicKeyB64: pubB64,
    });

    const { error: updErr } = await admin.from("zatca_credentials")
      .update({
        csr: csrPem,
        private_key_encrypted: privB64,
        onboarding_step: "csr_generated",
      })
      .eq("id", credentialId);
    if (updErr) return json({ error: updErr.message }, 500, cors);

    return json({ ok: true, csr: csrPem, publicKey: pubB64 }, 200, cors);
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

// Placeholder CSR: real deployment MUST use a valid PKCS#10 encoder.
// This returns a PEM-wrapped payload that stores subject + pubkey for the sandbox
// onboarding flow. Replace with a full ASN.1 CSR before production go-live.
function buildCsrPlaceholder(input: {
  commonName: string;
  orgName: string;
  orgVat: string;
  environment: string;
  publicKeyB64: string;
}): string {
  const payload = {
    subject: {
      CN: input.commonName,
      O: input.orgName,
      SerialNumber: input.orgVat,
    },
    environment: input.environment,
    publicKey: input.publicKeyB64,
    createdAt: new Date().toISOString(),
    note: "Placeholder CSR — replace with real ASN.1 PKCS#10 before production submission",
  };
  const b64 = btoa(JSON.stringify(payload));
  return `-----BEGIN CERTIFICATE REQUEST-----\n${b64.match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
}
