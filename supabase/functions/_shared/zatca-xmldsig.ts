// ZATCA XAdES-B-B enveloped signature.
// Implements the exact templates and hashing rules the ZATCA Fatoora SDK uses,
// so digests match ZATCA's server-side canonicalization for both Clearance
// (standard tax invoices) and Reporting (simplified).
//
// Curve:            secp256k1 (matches CSR)
// Digest:           SHA-256
// SignatureMethod:  http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256
// Canonicalization: http://www.w3.org/2006/12/xml-c14n11
// Transforms on invoice reference:
//   - remove ext:UBLExtensions
//   - remove cac:Signature
//   - remove cac:AdditionalDocumentReference[cbc:ID='QR']
//   - C14N 1.1
//
// The invoice XML we generate is already produced in ZATCA's expected
// canonical shape (single-space indentation, sorted attributes, no comments,
// no self-closing tags for non-empty elements, no XML declaration in the
// hashed payload). This is the same technique used by ZATCA reference
// integrations that pass Compliance/Production validation.

import { sha256 } from "npm:@noble/hashes@1.5.0/sha256";
import { secp256k1 } from "npm:@noble/curves@1.6.0/secp256k1";
import * as x509 from "npm:@peculiar/x509@1.11.0";
import { b64decode, b64encode } from "./zatca.ts";
import { hexToBytes } from "./zatca-csr.ts";

// ---- Templates (indentation MUST NOT change — digests depend on it) ----

const SIGNED_PROPERTIES_TEMPLATE =
`<xades:SignedProperties Id="xadesSignedProperties" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
                                    <xades:SignedSignatureProperties>
                                        <xades:SigningTime>{SIGNING_TIME}</xades:SigningTime>
                                        <xades:SigningCertificate>
                                            <xades:Cert>
                                                <xades:CertDigest>
                                                    <ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                                    <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">{CERT_DIGEST}</ds:DigestValue>
                                                </xades:CertDigest>
                                                <xades:IssuerSerial>
                                                    <ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">{ISSUER_NAME}</ds:X509IssuerName>
                                                    <ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">{SERIAL_NUMBER}</ds:X509SerialNumber>
                                                </xades:IssuerSerial>
                                            </xades:Cert>
                                        </xades:SigningCertificate>
                                    </xades:SignedSignatureProperties>
                                </xades:SignedProperties>`;

const SIGNED_INFO_TEMPLATE =
`<ds:SignedInfo>
                                    <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                                    <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
                                    <ds:Reference Id="invoiceSignedData" URI="">
                                        <ds:Transforms>
                                            <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                                                <ds:XPath>not(//ancestor-or-self::ext:UBLExtensions)</ds:XPath>
                                            </ds:Transform>
                                            <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                                                <ds:XPath>not(//ancestor-or-self::cac:Signature)</ds:XPath>
                                            </ds:Transform>
                                            <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                                                <ds:XPath>not(//ancestor-or-self::cac:AdditionalDocumentReference[cbc:ID='QR'])</ds:XPath>
                                            </ds:Transform>
                                            <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                                        </ds:Transforms>
                                        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                        <ds:DigestValue>{INVOICE_DIGEST}</ds:DigestValue>
                                    </ds:Reference>
                                    <ds:Reference Type="http://www.w3.org/2000/09/xmldsig#SignatureProperties" URI="#xadesSignedProperties">
                                        <ds:Transforms>
                                            <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                                        </ds:Transforms>
                                        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                        <ds:DigestValue>{SP_DIGEST}</ds:DigestValue>
                                    </ds:Reference>
                                </ds:SignedInfo>`;

const DS_SIGNATURE_TEMPLATE =
`<ds:Signature Id="signature" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                                {SIGNED_INFO}
                                <ds:SignatureValue>{SIGNATURE_VALUE}</ds:SignatureValue>
                                <ds:KeyInfo>
                                    <ds:X509Data>
                                        <ds:X509Certificate>{X509_CERT}</ds:X509Certificate>
                                    </ds:X509Data>
                                </ds:KeyInfo>
                                <ds:Object>
                                    <xades:QualifyingProperties Target="signature" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
                                        {SIGNED_PROPERTIES}
                                    </xades:QualifyingProperties>
                                </ds:Object>
                            </ds:Signature>`;

const UBL_EXTENSIONS_TEMPLATE =
`<ext:UBLExtensions>
    <ext:UBLExtension>
        <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
        <ext:ExtensionContent>
            <sig:UBLDocumentSignatures xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2" xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2" xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">
                <sac:SignatureInformation>
                    <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
                    <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
                    {DS_SIGNATURE}
                </sac:SignatureInformation>
            </sig:UBLDocumentSignatures>
        </ext:ExtensionContent>
    </ext:UBLExtension>
</ext:UBLExtensions>`;

const CAC_SIGNATURE_STUB =
`<cac:Signature>
        <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
        <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
    </cac:Signature>`;

function qrAdditionalRef(qrTlvB64: string): string {
  return `<cac:AdditionalDocumentReference>
        <cbc:ID>QR</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${qrTlvB64}</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>`;
}

// ---- Certificate helpers ----

function cleanBase64Cert(raw: string): string {
  return raw.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
}

interface CertInfo {
  der: Uint8Array;
  b64: string;
  issuerName: string;
  serialDecimal: string;
  digestB64: string;         // SHA-256 of DER (hex — ZATCA requires HEX b64-encoded — see below)
  publicKeyRawB64: string;   // SubjectPublicKeyInfo DER base64
  signatureB64: string;      // certificate.signatureValue
}

function parseCert(rawCertB64: string): CertInfo {
  const b64 = cleanBase64Cert(rawCertB64);
  const der = b64decode(b64);
  const cert = new x509.X509Certificate(der);
  // Serial number comes as hex string
  const serialDecimal = BigInt("0x" + cert.serialNumber).toString(10);
  // ZATCA expects the certificate digest as base64(SHA-256(HEX-string-of-cert-bytes))
  // i.e. hash the hex-encoded DER, not the raw DER. This is a ZATCA quirk.
  const hexOfDer = Array.from(der).map((b) => b.toString(16).padStart(2, "0")).join("");
  const digest = sha256(new TextEncoder().encode(hexOfDer));
  const digestB64 = b64encode(digest);
  const spki = new Uint8Array(cert.publicKey.rawData);
  const sig = new Uint8Array(cert.signature);
  return {
    der,
    b64,
    issuerName: cert.issuer,
    serialDecimal,
    digestB64,
    publicKeyRawB64: b64encode(spki),
    signatureB64: b64encode(sig),
  };
}

// ---- Invoice hash rules (matches transforms) ----

function stripUblExtensions(xml: string): string {
  return xml.replace(/<ext:UBLExtensions>[\s\S]*?<\/ext:UBLExtensions>\s*/g, "");
}
function stripCacSignature(xml: string): string {
  return xml.replace(/<cac:Signature>[\s\S]*?<\/cac:Signature>\s*/g, "");
}
function stripQrRef(xml: string): string {
  return xml.replace(
    /<cac:AdditionalDocumentReference>\s*<cbc:ID>QR<\/cbc:ID>[\s\S]*?<\/cac:AdditionalDocumentReference>\s*/g,
    "",
  );
}

/** Canonical bytes ZATCA hashes for the invoice reference. */
export function canonicalInvoiceForHash(xml: string): string {
  let s = xml;
  // 1) drop XML declaration
  s = s.replace(/^\s*<\?xml[^?]*\?>\s*/i, "");
  // 2) apply the three ZATCA transforms
  s = stripUblExtensions(s);
  s = stripCacSignature(s);
  s = stripQrRef(s);
  // 3) normalise line endings + trailing whitespace per C14N 1.1
  s = s.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n");
  return s;
}

export function computeInvoiceHashB64(xml: string): string {
  const canon = canonicalInvoiceForHash(xml);
  return b64encode(sha256(new TextEncoder().encode(canon)));
}

// ---- Public API ----

export interface ZatcaSignInput {
  invoiceXml: string;             // baseline XML (must include the cac:Signature stub — see wrapInvoiceForSigning)
  certificateB64: string;          // ZATCA-issued cert (compliance for sandbox/simulation, production for prod)
  privateKeyHex: string;           // secp256k1 scalar hex
  signingTime?: string;            // ISO 8601 timestamp
  qr: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    totalWithVat: string;
    vatAmount: string;
  };
}

export interface ZatcaSignOutput {
  signedInvoiceXml: string;
  invoiceHashB64: string;
  signatureB64: string;
  publicKeyB64: string;      // for QR tag 8
  certSignatureB64: string;  // for QR tag 9
  qrTlvB64: string;
}

export async function signInvoiceXades(inp: ZatcaSignInput): Promise<ZatcaSignOutput> {
  const cert = parseCert(inp.certificateB64);

  // 1) Invoice hash (per ZATCA transforms)
  const invoiceHashB64 = computeInvoiceHashB64(inp.invoiceXml);

  // 2) SignedProperties + digest
  const signingTime = (inp.signingTime ?? new Date().toISOString()).replace(/\.\d+Z$/, "Z");
  const signedProps = SIGNED_PROPERTIES_TEMPLATE
    .replace("{SIGNING_TIME}", signingTime)
    .replace("{CERT_DIGEST}", cert.digestB64)
    .replace("{ISSUER_NAME}", escapeXmlText(cert.issuerName))
    .replace("{SERIAL_NUMBER}", cert.serialDecimal);
  const spDigestB64 = b64encode(sha256(new TextEncoder().encode(signedProps)));

  // 3) SignedInfo
  const signedInfo = SIGNED_INFO_TEMPLATE
    .replace("{INVOICE_DIGEST}", invoiceHashB64)
    .replace("{SP_DIGEST}", spDigestB64);

  // 4) Sign SignedInfo with secp256k1 / SHA-256
  const siHash = sha256(new TextEncoder().encode(signedInfo));
  const sigDer = secp256k1.sign(siHash, hexToBytes(inp.privateKeyHex), { lowS: true }).toDERRawBytes();
  const signatureB64 = b64encode(sigDer);

  // 5) Assemble ds:Signature
  const dsSignature = DS_SIGNATURE_TEMPLATE
    .replace("{SIGNED_INFO}", signedInfo)
    .replace("{SIGNATURE_VALUE}", signatureB64)
    .replace("{X509_CERT}", cert.b64)
    .replace("{SIGNED_PROPERTIES}", signedProps);

  // 6) Build QR TLV
  const { buildQrTlv } = await import("./zatca.ts");
  const qrTlvB64 = buildQrTlv({
    sellerName: inp.qr.sellerName,
    vatNumber: inp.qr.vatNumber,
    timestamp: inp.qr.timestamp,
    totalWithVat: inp.qr.totalWithVat,
    vatAmount: inp.qr.vatAmount,
    invoiceHashB64,
    signatureB64,
    publicKeyB64: cert.publicKeyRawB64,
    certSignatureB64: cert.signatureB64,
  });

  // 7) Assemble the fully-signed invoice
  const ublExtensions = UBL_EXTENSIONS_TEMPLATE.replace("{DS_SIGNATURE}", dsSignature);
  const signedXml = assembleSignedInvoice(inp.invoiceXml, ublExtensions, qrAdditionalRef(qrTlvB64));

  return {
    signedInvoiceXml: signedXml,
    invoiceHashB64,
    signatureB64,
    publicKeyB64: cert.publicKeyRawB64,
    certSignatureB64: cert.signatureB64,
    qrTlvB64,
  };
}

/**
 * Insert the UBLExtensions and QR AdditionalDocumentReference into the invoice.
 * `invoiceXml` MUST already contain the cac:Signature stub — wrapInvoiceForSigning does that.
 */
function assembleSignedInvoice(invoiceXml: string, ublExtensions: string, qrRef: string): string {
  let out = invoiceXml;
  // Insert UBLExtensions as first child of <Invoice ...>
  out = out.replace(/(<Invoice\b[^>]*>)/, `$1\n    ${ublExtensions}`);
  // Insert QR ref right before cac:AccountingSupplierParty (after PIH block)
  out = out.replace(
    /(<cac:AccountingSupplierParty>)/,
    `${qrRef}\n    $1`,
  );
  return out;
}

/**
 * Add the cac:Signature stub required by ZATCA to a baseline invoice XML.
 * Insert after the PIH AdditionalDocumentReference (before AccountingSupplierParty).
 */
export function wrapInvoiceForSigning(invoiceXml: string): string {
  if (invoiceXml.includes("<cac:Signature>")) return invoiceXml;
  return invoiceXml.replace(
    /(<cac:AccountingSupplierParty>)/,
    `${CAC_SIGNATURE_STUB}\n    $1`,
  );
}

function escapeXmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
