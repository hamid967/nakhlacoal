// Shared ZATCA (Fatoora) helpers for Phase-2 e-invoicing.
// Implements: TLV QR encoding, SHA-256 hashing, base64 helpers, endpoint routing.
// NOTE: Deno runtime — uses Web Crypto + std/encoding.

export const ZATCA_ENDPOINTS = {
  sandbox: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
  simulation: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
  production: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
} as const;

export type ZatcaEnv = keyof typeof ZATCA_ENDPOINTS;

export function zatcaBase(env: string): string {
  return ZATCA_ENDPOINTS[(env as ZatcaEnv)] ?? ZATCA_ENDPOINTS.sandbox;
}

// ---- Base64 helpers -------------------------------------------------------
export function b64encode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
export function b64decode(str: string): Uint8Array {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---- SHA-256 --------------------------------------------------------------
export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function sha256Base64(input: string | Uint8Array): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const hash = await crypto.subtle.digest("SHA-256", data);
  return b64encode(new Uint8Array(hash));
}

// ---- TLV QR encoding (ZATCA spec) ----------------------------------------
// Tags:
//  1: Seller name
//  2: Seller VAT
//  3: Invoice timestamp (ISO-8601)
//  4: Invoice total (with VAT)
//  5: VAT total
//  6: XML invoice hash (base64)
//  7: ECDSA signature (base64) — Phase 2 only
//  8: ECDSA public key
//  9: Certificate signature (issuer) — optional
function tlv(tag: number, value: string): Uint8Array {
  const bytes = new TextEncoder().encode(value);
  const out = new Uint8Array(2 + bytes.length);
  out[0] = tag;
  out[1] = bytes.length;
  out.set(bytes, 2);
  return out;
}
export function buildQrTlv(input: {
  sellerName: string;
  vatNumber: string;
  timestamp: string; // ISO-8601
  totalWithVat: string;
  vatAmount: string;
  invoiceHashB64?: string;
  signatureB64?: string;
  publicKeyB64?: string;
  certSignatureB64?: string;
}): string {
  const parts: Uint8Array[] = [
    tlv(1, input.sellerName),
    tlv(2, input.vatNumber),
    tlv(3, input.timestamp),
    tlv(4, input.totalWithVat),
    tlv(5, input.vatAmount),
  ];
  if (input.invoiceHashB64) parts.push(tlv(6, input.invoiceHashB64));
  if (input.signatureB64) parts.push(tlv(7, input.signatureB64));
  if (input.publicKeyB64) parts.push(tlv(8, input.publicKeyB64));
  if (input.certSignatureB64) parts.push(tlv(9, input.certSignatureB64));

  const total = parts.reduce((n, p) => n + p.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    merged.set(p, off);
    off += p.length;
  }
  return b64encode(merged);
}

// ---- Minimal UBL 2.1 invoice XML template -------------------------------
// Simplified builder — sufficient for ZATCA sandbox validation.
// For production, replace with a full C14N-canonical builder.
export interface UblInvoiceInput {
  invoiceNumber: string;
  uuid: string;
  issueDate: string;   // YYYY-MM-DD
  issueTime: string;   // HH:MM:SS
  invoiceTypeCode: string; // '388' standard, '381' credit note, '383' debit
  isSimplified: boolean;
  icv: number;
  pih: string;
  seller: {
    name: string;
    vat: string;
    crn?: string;
    address: { street: string; building: string; city: string; postal: string; district: string; countryCode: string; };
  };
  buyer?: {
    name: string;
    vat?: string;
    address?: { street?: string; city?: string; postal?: string; countryCode?: string };
  };
  currency: string; // 'SAR'
  vatRate: number;  // 0.15
  lines: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    lineExtension: number; // qty*price
    vatAmount: number;     // line vat
    totalWithVat: number;
  }>;
  totals: {
    lineExtension: number;
    taxExclusive: number;
    taxInclusive: number;
    vatAmount: number;
    payable: number;
  };
}

const NS = `xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"`;

export function buildUblInvoice(inp: UblInvoiceInput): string {
  const typeName = inp.isSimplified ? "0200000" : "0100000";
  const linesXml = inp.lines.map((l) => `
  <cac:InvoiceLine>
    <cbc:ID>${l.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${l.quantity.toFixed(2)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${inp.currency}">${l.lineExtension.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${inp.currency}">${l.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${inp.currency}">${l.totalWithVat.toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXml(l.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${(inp.vatRate * 100).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${inp.currency}">${l.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join("");

  const buyerXml = inp.buyer ? `
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${inp.buyer.vat ? `<cac:PartyTaxScheme><cbc:CompanyID>${inp.buyer.vat}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : ""}
      <cac:PartyLegalEntity><cbc:RegistrationName>${escapeXml(inp.buyer.name)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice ${NS}>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${inp.invoiceNumber}</cbc:ID>
  <cbc:UUID>${inp.uuid}</cbc:UUID>
  <cbc:IssueDate>${inp.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${inp.issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${typeName}">${inp.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${inp.currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${inp.currency}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${inp.icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${inp.pih}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification><cbc:ID schemeID="CRN">${inp.seller.crn ?? ""}</cbc:ID></cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(inp.seller.address.street)}</cbc:StreetName>
        <cbc:BuildingNumber>${inp.seller.address.building}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${escapeXml(inp.seller.address.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(inp.seller.address.city)}</cbc:CityName>
        <cbc:PostalZone>${inp.seller.address.postal}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${inp.seller.address.countryCode}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${inp.seller.vat}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(inp.seller.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  ${buyerXml}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${inp.currency}">${inp.totals.vatAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${inp.currency}">${inp.totals.taxExclusive.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${inp.currency}">${inp.totals.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${(inp.vatRate * 100).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${inp.currency}">${inp.totals.lineExtension.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${inp.currency}">${inp.totals.taxExclusive.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${inp.currency}">${inp.totals.taxInclusive.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${inp.currency}">${inp.totals.payable.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${linesXml}
</Invoice>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
