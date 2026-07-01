// Public, read-only endpoint that returns sanitized tracking IDs.
// Keeps analytics_settings table restricted to admins while still letting
// the public site bootstrap GA4 / GTM scripts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCors } from "../_shared/cors.ts";

const GA4_RE = /^G-[A-Z0-9]{6,}$/;
const GTM_RE = /^GTM-[A-Z0-9]{4,}$/;

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req, "GET, OPTIONS");
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data } = await supabase
      .from("analytics_settings")
      .select("ga4_measurement_id, gtm_container_id, enabled")
      .eq("id", true)
      .maybeSingle();

    const enabled = !!data?.enabled;
    const ga4 = enabled && data?.ga4_measurement_id && GA4_RE.test(data.ga4_measurement_id)
      ? data.ga4_measurement_id
      : null;
    const gtm = enabled && data?.gtm_container_id && GTM_RE.test(data.gtm_container_id)
      ? data.gtm_container_id
      : null;

    return new Response(
      JSON.stringify({ enabled, ga4_measurement_id: ga4, gtm_container_id: gtm }),
      {
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "cache-control": "public, max-age=300",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ enabled: false, ga4_measurement_id: null, gtm_container_id: null }),
      { headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
});
