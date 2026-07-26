// Signs an invoice and submits it to ZATCA (Clearance for B2B / Reporting for B2C).
// Called by DB trigger on invoices.status='issued', or manually.
//
// Body: { invoiceId: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { buildCors } from "../_shared/cors.ts";
import {
  buildUblInvoice,
  zatcaBase,
} from "../_shared/zatca.ts";
import {
  signInvoiceXades,
  wrapInvoiceForSigning,
  computeInvoiceHashB64,
} from "../_shared/zatca-xmldsig.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const cors = buildCors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { invoiceId } = await req.json();
    if (!invoiceId) return json({ error: "invoiceId_required" }, 400, cors);

    // 1) Fetch invoice + items
    const { data: inv, error: invErr } = await admin.from("invoices").select("*").eq("id", invoiceId).single();
    if (invErr || !inv) return json({ error: "invoice_not_found" }, 404, cors);
    if (inv.zatca_status === "cleared" || inv.zatca_status === "reported") {
      return json({ ok: true, note: "already_submitted", status: inv.zatca_status }, 200, cors);
    }
    const { data: items } = await admin.from("invoice_items").select("*").eq("invoice_id", invoiceId);

    // 2) Pick active credential
    const { data: cred } = await admin.from("zatca_credentials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!cred) return json({ error: "no_active_zatca_credential" }, 412, cors);

    // 3) Compute ICV + PIH
    const { data: nextRow } = await admin.rpc("zatca_next_icv", { _credential_id: cred.id });
    const next = Array.isArray(nextRow) ? nextRow[0] : nextRow;
    const icv: number = next.next_icv;
    const pih: string = next.previous_hash;

    // 4) Build UBL XML
    const uuid = inv.zatca_uuid ?? crypto.randomUUID();
    const issued = new Date(inv.issued_at ?? inv.created_at ?? Date.now());
    const isSimplified = inv.invoice_type === "simplified";
    const xml = buildUblInvoice({
      invoiceNumber: inv.number ?? inv.id.slice(0, 8),
      uuid,
      issueDate: issued.toISOString().slice(0, 10),
      issueTime: issued.toISOString().slice(11, 19),
      invoiceTypeCode: inv.invoice_subtype ?? "388",
      isSimplified,
      icv,
      pih,
      seller: {
        name: cred.org_name,
        vat: cred.org_vat,
        crn: cred.org_cr ?? undefined,
        address: cred.org_address ?? {
          street: "Al Nakhla", building: "0001", city: "Jeddah",
          postal: "23411", district: "Al Rawdah", countryCode: "SA",
        },
      },
      buyer: inv.customer_name ? {
        name: inv.customer_name,
        vat: inv.counterparty_vat ?? undefined,
        address: inv.counterparty_address ?? undefined,
      } : undefined,
      currency: "SAR",
      vatRate: Number(inv.vat_rate ?? 0.15),
      lines: (items ?? []).map((it, i) => {
        const qty = Number(it.quantity ?? 1);
        const unit = Number(it.unit_price_sar ?? 0);
        const line = qty * unit;
        const vat = line * Number(inv.vat_rate ?? 0.15);
        return {
          id: i + 1,
          name: it.description ?? "Item",
          quantity: qty,
          unitPrice: unit,
          lineExtension: line,
          vatAmount: vat,
          totalWithVat: line + vat,
        };
      }),
      totals: {
        lineExtension: Number(inv.subtotal_sar ?? 0),
        taxExclusive: Number(inv.subtotal_sar ?? 0),
        taxInclusive: Number(inv.grand_total_sar ?? 0),
        vatAmount: Number(inv.vat_amount_sar ?? 0),
        payable: Number(inv.grand_total_sar ?? 0),
      },
    });

    // 5) Wrap baseline invoice with the cac:Signature stub required by XAdES
    const baseline = wrapInvoiceForSigning(xml);

    // 6) Pick certificate for the environment
    const certificateB64 = cred.environment === "production"
      ? cred.production_csid
      : cred.compliance_csid;

    let signedXml = baseline;
    let invoiceHashB64: string;
    let qrTlvB64 = "";

    if (certificateB64 && cred.private_key_encrypted) {
      // Full XAdES-B-B signature — required for Clearance/Reporting
      const signed = await signInvoiceXades({
        invoiceXml: baseline,
        certificateB64,
        privateKeyHex: cred.private_key_encrypted,
        signingTime: issued.toISOString(),
        qr: {
          sellerName: cred.org_name,
          vatNumber: cred.org_vat,
          timestamp: issued.toISOString(),
          totalWithVat: Number(inv.grand_total_sar ?? 0).toFixed(2),
          vatAmount: Number(inv.vat_amount_sar ?? 0).toFixed(2),
        },
      });
      signedXml = signed.signedInvoiceXml;
      invoiceHashB64 = signed.invoiceHashB64;
      qrTlvB64 = signed.qrTlvB64;
    } else {
      // No cert yet (pre-onboarding) — hash only, no signature.
      // ZATCA will reject on submit; useful for local preview.
      invoiceHashB64 = computeInvoiceHashB64(baseline);
      console.warn("[zatca-sign-invoice] missing certificate/key — invoice not XAdES signed");
    }

    const qr = qrTlvB64;

    // 7) Insert zatca_invoices row
    const submissionType = isSimplified ? "reporting" : "clearance";
    const { data: zRow, error: zErr } = await admin.from("zatca_invoices").insert({
      invoice_id: invoiceId,
      credential_id: cred.id,
      uuid,
      icv,
      pih,
      hash: invoiceHashB64,
      xml_signed: signedXml,
      qr_base64: qr,
      invoice_type: isSimplified ? "simplified" : "standard",
      invoice_subtype: inv.invoice_subtype ?? "388",
      submission_type: submissionType,
      status: certificateB64 ? "signed" : "pending",
    }).select().single();
    if (zErr) return json({ error: zErr.message }, 500, cors);

    // 7) Submit to ZATCA
    const csid = cred.production_csid ?? cred.compliance_csid;
    let apiStatus = "pending";
    let apiBody: unknown = null;
    if (csid) {
      const endpoint = submissionType === "clearance" ? "/invoices/clearance/single" : "/invoices/reporting/single";
      const url = `${zatcaBase(cred.environment)}${endpoint}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Version": "V2",
          "Clearance-Status": submissionType === "clearance" ? "1" : "0",
          "Authorization": `Basic ${btoa(`${csid}:${cred.compliance_request_id ?? ""}`)}`,
        },
        body: JSON.stringify({
          invoiceHash: invoiceHashB64,
          uuid,
          invoice: btoa(signedXml),
        }),
      });
      apiBody = await res.json().catch(() => ({}));
      apiStatus = res.ok
        ? (submissionType === "clearance" ? "cleared" : "reported")
        : "failed";
    }

    await admin.from("zatca_invoices").update({
      status: apiStatus,
      zatca_response: apiBody,
      submitted_at: new Date().toISOString(),
      cleared_at: (apiStatus === "cleared" || apiStatus === "reported") ? new Date().toISOString() : null,
      attempts: 1,
    }).eq("id", zRow.id);

    await admin.from("invoices").update({
      zatca_status: apiStatus,
      zatca_qr: qr,
      zatca_uuid: uuid,
    }).eq("id", invoiceId);

    return json({ ok: true, status: apiStatus, icv, uuid, qr }, 200, cors);
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
