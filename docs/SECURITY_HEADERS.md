# HTTP Security Headers — فحم النخلة | Palm Charcoal

Some CSP directives are **ignored inside `<meta http-equiv>`** and only take effect when sent as **HTTP response headers**:

| Directive | Reason it must be HTTP-only |
|---|---|
| `frame-ancestors` | Explicitly disallowed in `<meta>` by the CSP spec |
| `form-action` | Only enforced from headers in most browsers |
| `sandbox`, `report-uri`, `report-to` | Same — ignored in `<meta>` |

The static `<meta>` CSP in `index.html` covers all remaining directives as defense-in-depth. To enforce the header-only ones, pick the file matching your host.

---

## 1. Lovable hosting (`*.lovable.app`)
The Lovable edge does **not** currently expose a custom-header config. Options:

1. **Attach a custom domain** and front it with **Cloudflare** (free tier). In the CF dashboard → *Rules → Transform Rules → HTTP Response Header Modification*, paste the values from `public/_headers`. Applies in <30s.
2. Or use **Cloudflare Workers / Pages Functions** to inject the headers.

## 2. Netlify / Cloudflare Pages
Already handled. On deploy, `public/_headers` is copied to the site root and both providers read it automatically. Verify with:

```bash
curl -sI https://alnakhlacoal.com | grep -iE 'content-security|frame|strict-transport|referrer|permissions'
```

## 3. Vercel
Already handled by `vercel.json` at the repo root.

## 4. Nginx (self-host)

```nginx
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://api.whatsapp.com https://wa.me; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss:; frame-src 'self' https://www.google.com https://www.youtube.com https://www.google.com/maps/; media-src 'self' https: blob: data:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()" always;
```

## 5. Apache (`.htaccess`)

```apache
Header always set Content-Security-Policy "…same value as above…"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
```

---

## Verification checklist

After going live, run:

- **Mozilla Observatory** → https://observatory.mozilla.org/analyze/alnakhlacoal.com — target **A+**.
- **Security Headers** → https://securityheaders.com/?q=alnakhlacoal.com — target **A+**.
- **CSP Evaluator** → https://csp-evaluator.withgoogle.com/

Any change to allowed script/style/font sources → update **both** `index.html` (`<meta>` CSP) **and** `public/_headers` + `vercel.json` in the same commit to keep them in sync.
