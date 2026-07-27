REVOKE EXECUTE ON FUNCTION public.compute_daily_kpi(date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_customer_segments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_product_intelligence() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_daily_kpi(date) TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_customer_segments() TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_product_intelligence() TO service_role;