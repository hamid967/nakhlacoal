GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO anon, authenticated;
GRANT ALL ON public.carts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon, authenticated;
GRANT ALL ON public.cart_items TO service_role;