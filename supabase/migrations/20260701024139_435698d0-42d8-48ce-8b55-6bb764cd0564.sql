
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory_items;
CREATE POLICY "Admins can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
REVOKE SELECT ON public.inventory_items FROM anon;

DROP POLICY IF EXISTS "trademark_logos_public_read" ON storage.objects;
