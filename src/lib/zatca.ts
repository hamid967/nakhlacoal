// ZATCA Phase-1 base64 TLV QR payload
function tlv(tag: number, value: string): Uint8Array {
  const bytes = new TextEncoder().encode(value);
  const out = new Uint8Array(2 + bytes.length);
  out[0] = tag;
  out[1] = bytes.length;
  out.set(bytes, 2);
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export function buildZatcaQr(opts: {
  sellerName: string;
  vatNumber: string;
  timestamp: string; // ISO 8601
  total: number; // grand total with VAT
  vatAmount: number;
}): string {
  const parts = [
    tlv(1, opts.sellerName),
    tlv(2, opts.vatNumber),
    tlv(3, opts.timestamp),
    tlv(4, opts.total.toFixed(2)),
    tlv(5, opts.vatAmount.toFixed(2)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    merged.set(p, off);
    off += p.length;
  }
  return toBase64(merged);
}
