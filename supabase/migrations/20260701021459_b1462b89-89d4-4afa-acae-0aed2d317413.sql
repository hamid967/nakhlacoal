DROP POLICY IF EXISTS "orders_insert_public" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Visitors and users can create their own orders" ON public.orders;

CREATE POLICY "orders_insert_hardened"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (
    user_id IS NULL
    AND product_type IS NOT NULL AND length(btrim(product_type)) BETWEEN 1 AND 100
    AND quantity IS NOT NULL AND quantity > 0 AND quantity <= 1000000
    AND company_name IS NOT NULL AND length(btrim(company_name)) BETWEEN 2 AND 200
    AND contact_name IS NOT NULL AND length(btrim(contact_name)) BETWEEN 2 AND 100
    AND phone IS NOT NULL AND length(btrim(phone)) BETWEEN 7 AND 25
  )
);