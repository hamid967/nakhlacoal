import { useEffect, useState } from 'react';

/**
 * Image diagnostics overlay.
 * Activate with `?debug=img` in the URL (any environment) or shortcut Ctrl+Shift+I.
 * Audits every <img>:
 *  - Rendered CSS size vs natural intrinsic size (under-resolution detection)
 *  - currentSrc format (avif / webp / jpeg / png / svg)
 *  - DPR-aware quality ratio (natural / (rendered * dpr))
 *  - Flags JPEG/PNG fallbacks when a <picture> ancestor offered avif/webp
 */
type Row = {
  src: string;
  alt: string;
  format: string;
  rendered: string;
  natural: string;
  ratio: number;
  flags: string[];
};

const fmtFromUrl = (u: string): string => {
  const m = u.match(/\.(avif|webp|jpe?g|png|svg|gif)(\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : '?';
};

function audit(): Row[] {
  const dpr = window.devicePixelRatio || 1;
  const imgs = Array.from(document.images);
  return imgs.map((img) => {
    const r = img.getBoundingClientRect();
    const rw = Math.round(r.width);
    const rh = Math.round(r.height);
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const src = img.currentSrc || img.src;
    const format = fmtFromUrl(src);
    const targetW = rw * dpr;
    const ratio = targetW > 0 ? nw / targetW : 1;
    const flags: string[] = [];

    if (rw === 0 || rh === 0) flags.push('hidden');
    else {
      if (ratio < 0.85) flags.push('low-res');
      if (ratio > 2.2) flags.push('over-fetched');
    }
    // Detect fallback when a <picture> provided modern sources but jpeg/png loaded.
    const picture = img.closest('picture');
    if (picture && (format === 'jpg' || format === 'png')) {
      const offered = Array.from(picture.querySelectorAll('source'))
        .map((s) => s.getAttribute('type') || '')
        .filter((t) => /avif|webp/.test(t));
      if (offered.length) flags.push(`fallback(${offered.map((t) => t.split('/')[1]).join(',')})`);
    }
    return {
      src: src.split('/').pop()?.split('?')[0] || src,
      alt: img.alt || '—',
      format,
      rendered: `${rw}×${rh}`,
      natural: `${nw}×${nh}`,
      ratio: Math.round(ratio * 100) / 100,
      flags,
    };
  });
}

export function ImageDiagnostics() {
  const [enabled, setEnabled] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'img') setEnabled(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        setEnabled((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const run = () => setRows(audit());
    run();
    const id = window.setInterval(run, 1500);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled) return null;

  const total = rows.length;
  const lowRes = rows.filter((r) => r.flags.includes('low-res')).length;
  const fallback = rows.filter((r) => r.flags.some((f) => f.startsWith('fallback'))).length;
  const over = rows.filter((r) => r.flags.includes('over-fetched')).length;
  const dpr = window.devicePixelRatio || 1;

  return (
    <div
      dir="ltr"
      style={{
        position: 'fixed', right: 12, bottom: 12, zIndex: 99999,
        width: 460, maxHeight: '70vh', overflow: 'auto',
        background: 'rgba(8,12,10,0.96)', color: '#e7e3d8',
        border: '1px solid #b48a3b', borderRadius: 12, padding: 12,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ color: '#e6c46b' }}>Image Diagnostics</strong>
        <button
          onClick={() => setEnabled(false)}
          style={{ background: 'transparent', color: '#e6c46b', border: '1px solid #b48a3b', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
        >close</button>
      </div>
      <div style={{ marginBottom: 8, color: '#bdb59a' }}>
        DPR {dpr} · total {total} · <span style={{ color: lowRes ? '#ff7a7a' : '#7ad28a' }}>low-res {lowRes}</span>
        {' · '}<span style={{ color: fallback ? '#ffb86b' : '#7ad28a' }}>fallback {fallback}</span>
        {' · '}<span style={{ color: over ? '#ffb86b' : '#7ad28a' }}>over {over}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#e6c46b', textAlign: 'left' }}>
            <th>file</th><th>fmt</th><th>render</th><th>nat</th><th>×</th><th>flags</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid #2a2620' }}>
              <td title={r.alt} style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.src}</td>
              <td style={{ color: r.format === 'avif' ? '#7ad28a' : r.format === 'webp' ? '#9ad' : '#ffb86b' }}>{r.format}</td>
              <td>{r.rendered}</td>
              <td>{r.natural}</td>
              <td style={{ color: r.ratio < 0.85 ? '#ff7a7a' : r.ratio > 2.2 ? '#ffb86b' : '#7ad28a' }}>{r.ratio}</td>
              <td style={{ color: '#ff9' }}>{r.flags.join(' ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
