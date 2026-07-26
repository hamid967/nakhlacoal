// Full ZATCA-compliant PKCS#10 CSR generator.
// - Curve: secp256k1 (ZATCA mandate)
// - Signature: ecdsa-with-SHA256 (OID 1.2.840.10045.4.3.2)
// - Extensions:
//     - Custom template OID 1.3.6.1.4.1.311.20.2 = TSTZATCA-Code-Signing (sandbox) /
//       PREZATCA-Code-Signing (simulation) / ZATCA-Code-Signing (production)
//     - SubjectAltName DirectoryName with SN | UID | title | registeredAddress | businessCategory
//
// Implements ASN.1 DER manually — no external CSR library needed.
// Uses @noble/curves for secp256k1 keygen + signing.

import { secp256k1 } from "npm:@noble/curves@1.6.0/secp256k1";
import { sha256 } from "npm:@noble/hashes@1.5.0/sha256";
import { b64encode } from "./zatca.ts";

// ---------- DER primitives ----------
const enc = (bytes: number[] | Uint8Array) =>
  bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

function derLen(len: number): Uint8Array {
  if (len < 0x80) return new Uint8Array([len]);
  const bytes: number[] = [];
  let v = len;
  while (v > 0) { bytes.unshift(v & 0xff); v >>= 8; }
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}
function tlv(tag: number, value: Uint8Array): Uint8Array {
  const len = derLen(value.length);
  const out = new Uint8Array(1 + len.length + value.length);
  out[0] = tag;
  out.set(len, 1);
  out.set(value, 1 + len.length);
  return out;
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// ASN.1 types
const SEQUENCE = 0x30;
const SET = 0x31;
const INTEGER = 0x02;
const BIT_STRING = 0x03;
const OCTET_STRING = 0x04;
const NULL = 0x05;
const OID = 0x06;
const UTF8_STRING = 0x0c;
const PRINTABLE_STRING = 0x13;
const CONTEXT_0 = 0xa0;
const CONTEXT_4 = 0xa4; // for SAN DirectoryName [4]

function derSeq(...items: Uint8Array[]) { return tlv(SEQUENCE, concat(...items)); }
function derSet(...items: Uint8Array[]) { return tlv(SET, concat(...items)); }
function derInt(n: number | Uint8Array): Uint8Array {
  if (typeof n === "number") {
    if (n === 0) return tlv(INTEGER, new Uint8Array([0]));
    const bytes: number[] = [];
    let v = n;
    while (v > 0) { bytes.unshift(v & 0xff); v = v >>> 8; }
    if (bytes[0] & 0x80) bytes.unshift(0);
    return tlv(INTEGER, new Uint8Array(bytes));
  }
  // raw big-endian, ensure positive
  const b = n[0] & 0x80 ? concat(new Uint8Array([0]), n) : n;
  return tlv(INTEGER, b);
}
function derOid(oid: string): Uint8Array {
  const parts = oid.split(".").map((n) => parseInt(n, 10));
  const first = 40 * parts[0] + parts[1];
  const out: number[] = [first];
  for (let i = 2; i < parts.length; i++) {
    let v = parts[i];
    const stack: number[] = [];
    do { stack.unshift(v & 0x7f); v >>= 7; } while (v > 0);
    for (let j = 0; j < stack.length - 1; j++) stack[j] |= 0x80;
    out.push(...stack);
  }
  return tlv(OID, new Uint8Array(out));
}
function derUtf8(s: string) { return tlv(UTF8_STRING, new TextEncoder().encode(s)); }
function derPrintable(s: string) { return tlv(PRINTABLE_STRING, new TextEncoder().encode(s)); }
function derNull() { return tlv(NULL, new Uint8Array(0)); }
function derBitString(bytes: Uint8Array, unused = 0) {
  return tlv(BIT_STRING, concat(new Uint8Array([unused]), bytes));
}
function derOctet(bytes: Uint8Array) { return tlv(OCTET_STRING, bytes); }
function derCtx(index: number, bytes: Uint8Array, constructed = true) {
  const tag = (constructed ? 0xa0 : 0x80) | index;
  return tlv(tag, bytes);
}

// ---------- Subject / RDN helpers ----------
// OIDs
const OID_CN = "2.5.4.3";
const OID_O = "2.5.4.10";
const OID_OU = "2.5.4.11";
const OID_C = "2.5.4.6";
const OID_SN = "2.5.4.5"; // serialNumber
const OID_TITLE = "2.5.4.12";
const OID_UID = "0.9.2342.19200300.100.1.1";
const OID_REG_ADDR = "2.5.4.26"; // registeredAddress
const OID_BIZ_CAT = "2.5.4.15";  // businessCategory
const OID_ORG_ID = "2.5.4.97";   // organizationIdentifier (VAT)

const OID_EC_PUBLIC_KEY = "1.2.840.10045.2.1";
const OID_SECP256K1 = "1.3.132.0.10";
const OID_ECDSA_SHA256 = "1.2.840.10045.4.3.2";

const OID_EXT_REQUEST = "1.2.840.113549.1.9.14";
const OID_MS_CERT_TEMPLATE = "1.3.6.1.4.1.311.20.2"; // ZATCA reuses this MS OID
const OID_SUBJECT_ALT_NAME = "2.5.29.17";

function rdn(oidStr: string, value: Uint8Array) {
  return derSet(derSeq(derOid(oidStr), value));
}

// ---------- Template name per environment ----------
export function zatcaTemplate(env: string): string {
  if (env === "production") return "ZATCA-Code-Signing";
  if (env === "simulation") return "PREZATCA-Code-Signing";
  return "TSTZATCA-Code-Signing";
}

// ---------- PEM helpers ----------
export function toPem(label: string, der: Uint8Array): string {
  const b64 = b64encode(der);
  return `-----BEGIN ${label}-----\n${b64.match(/.{1,64}/g)!.join("\n")}\n-----END ${label}-----\n`;
}

// ---------- CSR builder ----------
export interface ZatcaCsrInput {
  environment: "sandbox" | "simulation" | "production" | string;
  commonName: string;         // e.g. "TST-886431145-399999999900003"
  organizationName: string;   // company legal name
  organizationalUnit: string; // branch / division
  countryCode?: string;       // ISO2, default SA
  vatNumber: string;          // 15-digit VAT
  invoiceType: string;        // 4-char bitmask "1100" = both standard + simplified
  location: string;           // registered address free-text
  industry: string;           // business category
  egsSerialNumber: string;    // "1-<solution>|2-<model>|3-<serial>"
}

export interface ZatcaCsrOutput {
  csrPem: string;
  csrDer: Uint8Array;
  privateKeyPem: string;      // SEC1 EC PRIVATE KEY
  privateKeyRawHex: string;   // 32-byte hex (secp256k1 scalar)
  publicKeyRawB64: string;    // uncompressed 65 bytes (04||X||Y) base64
}

export async function generateZatcaCsr(input: ZatcaCsrInput): Promise<ZatcaCsrOutput> {
  const country = input.countryCode || "SA";
  const template = zatcaTemplate(input.environment);

  // ---- keygen (secp256k1)
  const priv = secp256k1.utils.randomPrivateKey();          // 32 bytes
  const pubUncompressed = secp256k1.getPublicKey(priv, false); // 65 bytes 0x04||X||Y

  // ---- SubjectPublicKeyInfo
  const spkiAlg = derSeq(derOid(OID_EC_PUBLIC_KEY), derOid(OID_SECP256K1));
  const spki = derSeq(spkiAlg, derBitString(pubUncompressed));

  // ---- Subject
  const subject = derSeq(
    rdn(OID_C, derPrintable(country)),
    rdn(OID_O, derUtf8(input.organizationName)),
    rdn(OID_OU, derUtf8(input.organizationalUnit)),
    rdn(OID_CN, derUtf8(input.commonName)),
    rdn(OID_ORG_ID, derUtf8(input.vatNumber)),
  );

  // ---- SubjectAltName DirectoryName ----
  // Directory contains individual attributes per ZATCA spec:
  //   SN     -> EGS serial number "1-...|2-...|3-..."
  //   UID    -> VAT number
  //   title  -> invoice type bitmask
  //   registeredAddress -> location
  //   businessCategory  -> industry
  const sanDirectory = derSeq(
    rdn(OID_SN, derUtf8(input.egsSerialNumber)),
    rdn(OID_UID, derUtf8(input.vatNumber)),
    rdn(OID_TITLE, derUtf8(input.invoiceType)),
    rdn(OID_REG_ADDR, derUtf8(input.location)),
    rdn(OID_BIZ_CAT, derUtf8(input.industry)),
  );
  // GeneralName [4] directoryName is EXPLICIT SEQUENCE -> use context [4] constructed
  const generalName = derCtx(4, sanDirectory, true);
  const sanValue = derSeq(generalName);
  const sanExt = derSeq(derOid(OID_SUBJECT_ALT_NAME), derOctet(sanValue));

  // ---- MS/ZATCA Certificate Template extension ----
  // ExtensionValue = OCTET STRING wrapping UTF8String(template)
  const templateExt = derSeq(
    derOid(OID_MS_CERT_TEMPLATE),
    derOctet(derUtf8(template)),
  );

  // ---- Extensions SEQUENCE
  const extensions = derSeq(templateExt, sanExt);

  // ---- Attribute: extensionRequest ----
  const extReqAttr = derSeq(
    derOid(OID_EXT_REQUEST),
    derSet(extensions),
  );
  const attributes = derCtx(0, extReqAttr, true); // [0] IMPLICIT SET OF Attribute

  // ---- CertificationRequestInfo
  const certReqInfo = derSeq(
    derInt(0),          // version 0
    subject,
    spki,
    attributes,
  );

  // ---- Sign
  const digest = sha256(certReqInfo);
  const sigObj = secp256k1.sign(digest, priv, { lowS: true });
  const sigDer = sigObj.toDERRawBytes();

  const sigAlg = derSeq(derOid(OID_ECDSA_SHA256));
  const csrDer = derSeq(certReqInfo, sigAlg, derBitString(sigDer));

  // ---- Encode private key SEC1 (RFC 5915)
  //   ECPrivateKey ::= SEQUENCE {
  //     version INTEGER (1),
  //     privateKey OCTET STRING (32 bytes),
  //     parameters [0] EXPLICIT OID,
  //     publicKey  [1] EXPLICIT BIT STRING
  //   }
  const sec1 = derSeq(
    derInt(1),
    derOctet(priv),
    derCtx(0, derOid(OID_SECP256K1), true),
    derCtx(1, derBitString(pubUncompressed), true),
  );

  return {
    csrPem: toPem("CERTIFICATE REQUEST", csrDer),
    csrDer,
    privateKeyPem: toPem("EC PRIVATE KEY", sec1),
    privateKeyRawHex: bytesToHex(priv),
    publicKeyRawB64: b64encode(pubUncompressed),
  };
}

// ---------- secp256k1 signing helper for sign-invoice ----------
export async function zatcaSignSha256(msg: Uint8Array, privateKeyHex: string): Promise<Uint8Array> {
  const digest = sha256(msg);
  const sig = secp256k1.sign(digest, hexToBytes(privateKeyHex), { lowS: true });
  return sig.toDERRawBytes();
}

// ---------- hex helpers ----------
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}
