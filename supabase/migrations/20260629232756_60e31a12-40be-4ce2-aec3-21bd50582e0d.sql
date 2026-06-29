-- Make trademarks_public truly public-safe: run with view owner's
-- privileges so anonymous visitors bypass base-table RLS (which calls
-- has_role and 401s for anon). The view already excludes sensitive
-- owner/address fields, so this is safe.
ALTER VIEW public.trademarks_public SET (security_invoker = off);
GRANT SELECT ON public.trademarks_public TO anon, authenticated;