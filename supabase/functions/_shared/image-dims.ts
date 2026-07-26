// Probe the real pixel dimensions of a remote image by fetching only the
// first bytes and parsing the format header (PNG / JPEG / GIF / WebP).
// Returns null when the image can't be reached or the format isn't supported.

export type ImageDims = {
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'gif' | 'webp';
  bytes: number;
  contentType: string | null;
};

export type ImageProbeResult =
  | { ok: true; dims: ImageDims }
  | { ok: false; error: string; httpStatus?: number; contentType?: string | null };

const MAX_BYTES = 96 * 1024; // enough for JPEG SOF scan in almost all cases

export async function probeImageDims(url: string, ua = 'PalmCharcoalImageProbe/1.0'): Promise<ImageProbeResult> {
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: 'invalid_url' };
  let resp: Response;
  try {
    resp = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': ua,
        'Accept': 'image/*',
        'Range': `bytes=0-${MAX_BYTES - 1}`,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  const contentType = resp.headers.get('content-type');
  if (!resp.ok && resp.status !== 206) {
    // Consume + discard body so the socket is released.
    try { await resp.arrayBuffer(); } catch { /* ignore */ }
    return { ok: false, error: `http_${resp.status}`, httpStatus: resp.status, contentType };
  }
  const buf = new Uint8Array(await resp.arrayBuffer());
  const parsed = parseImageDims(buf);
  if (!parsed) return { ok: false, error: 'unsupported_or_truncated', httpStatus: resp.status, contentType };
  return { ok: true, dims: { ...parsed, bytes: buf.length, contentType } };
}

function parseImageDims(b: Uint8Array): { width: number; height: number; format: ImageDims['format'] } | null {
  if (b.length < 12) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);

  // PNG: 89 50 4E 47 0D 0A 1A 0A, then IHDR at offset 16 (width) / 20 (height), big-endian u32.
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    if (b.length < 24) return null;
    return { width: dv.getUint32(16, false), height: dv.getUint32(20, false), format: 'png' };
  }

  // GIF: 'GIF87a' or 'GIF89a'; width/height are little-endian u16 at offsets 6/8.
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
    return { width: dv.getUint16(6, true), height: dv.getUint16(8, true), format: 'gif' };
  }

  // RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    // Chunk header at offset 12: 4-byte fourCC + 4-byte size.
    if (b.length < 30) return null;
    const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (chunk === 'VP8 ') {
      // Lossy: dims at offset 26/28, 14-bit little-endian.
      const w = dv.getUint16(26, true) & 0x3fff;
      const h = dv.getUint16(28, true) & 0x3fff;
      return { width: w, height: h, format: 'webp' };
    }
    if (chunk === 'VP8L') {
      // Lossless: signature 0x2f at offset 20, then 4 bytes packed LE.
      if (b[20] !== 0x2f) return null;
      const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width: w, height: h, format: 'webp' };
    }
    if (chunk === 'VP8X') {
      // Extended: 24-bit little-endian canvas dims minus 1 at offset 24 (w) / 27 (h).
      const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
      const h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
      return { width: w, height: h, format: 'webp' };
    }
    return null;
  }

  // JPEG: starts with FF D8. Walk segments to the first SOF marker.
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 8 < b.length) {
      if (b[i] !== 0xff) return null;
      // Skip padding 0xFF bytes.
      while (i < b.length && b[i] === 0xff) i++;
      if (i >= b.length) return null;
      const marker = b[i]; i++;
      // Standalone markers: RSTn (D0-D7), SOI (D8), EOI (D9) — no length.
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 1 >= b.length) return null;
      const segLen = dv.getUint16(i, false);
      // SOF0..SOF15 except DHT (C4), JPG (C8), DAC (CC).
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        if (i + 7 >= b.length) return null;
        const height = dv.getUint16(i + 3, false);
        const width = dv.getUint16(i + 5, false);
        return { width, height, format: 'jpeg' };
      }
      i += segLen;
    }
    return null;
  }

  return null;
}

// Convenience: probe several image URLs in parallel, deduped.
export async function probeMany(urls: (string | null | undefined)[], ua?: string) {
  const uniq = [...new Set(urls.filter((u): u is string => !!u && /^https?:\/\//i.test(u)))];
  const entries = await Promise.all(uniq.map(async (u) => [u, await probeImageDims(u, ua)] as const));
  return Object.fromEntries(entries) as Record<string, ImageProbeResult>;
}
