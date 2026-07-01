// Shared CORS helper for Palm Charcoal edge functions.
// Restricts Access-Control-Allow-Origin to trusted origins to prevent
// cross-site abuse of credentialed browser calls.

const ALLOWED_ORIGINS = new Set<string>([
  "https://nakhlacoal.lovable.app",
  "https://www.alnakhlacoal.com",
  "https://alnakhlacoal.com",
  "https://id-preview--06513aac-9ddf-458b-8161-595178079007.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);

export function buildCors(
  req: Request,
  methods: string = "POST, OPTIONS",
): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": methods,
  };
}
