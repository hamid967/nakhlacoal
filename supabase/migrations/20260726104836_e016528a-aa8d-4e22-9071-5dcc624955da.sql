REVOKE ALL ON FUNCTION public.log_order_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_quote_status_change() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_order_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_quote_status_change() TO service_role;