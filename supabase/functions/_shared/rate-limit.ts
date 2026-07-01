// Durable, cross-isolate rate limiter backed by Postgres via SECURITY DEFINER RPC.
// Fails OPEN on infra errors so a DB blip never breaks the public site.
import { createClient } from "npm:@supabase/supabase-js@2";

let _admin: ReturnType<typeof createClient> | null = null;
function admin() {
  if (_admin) return _admin;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("missing_supabase_env");
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for") ?? "";
  return xf.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns true when the request is allowed, false when the caller has exceeded
 * `max` hits inside `windowSeconds`. Any error is treated as allowed.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const { data, error } = await admin().rpc("check_rate_limit", {
      _key: key,
      _max: max,
      _window_seconds: windowSeconds,
    });
    if (error) {
      console.warn("[rate-limit] rpc error:", error.message);
      return true;
    }
    return data === true;
  } catch (e) {
    console.warn("[rate-limit] threw:", e);
    return true;
  }
}
