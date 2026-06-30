DROP POLICY IF EXISTS "Visitors and users can create their own orders" ON public.orders;
CREATE POLICY "orders_insert_public"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);