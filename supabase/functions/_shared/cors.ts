// Shared CORS helper for Palm Charcoal edge functions.
// Restricts Access-Control-Allow-Origin to trusted origins to prevent
// cross-site abuse of credentialed browser calls.

const ALLOWED_ORIGINS = new Set<string>([
  "https://nakhlacoal.lovable.app",
  "https://www.alnakhlacoal.com",
  "https://alnakhlacoal.com",
  "http://localhost:8080",
  "http://localhost:5173",
]);

// Trust any Lovable-hosted preview/published subdomain (id-preview--*, preview--*, *.lovable.app, *.lovable.dev).
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*lovable\.(app|dev)$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/i,
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

export function buildCors(
  req: Request,
  methods: string = "POST, OPTIONS",
): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow = isAllowedOrigin(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": methods,
  };
}
