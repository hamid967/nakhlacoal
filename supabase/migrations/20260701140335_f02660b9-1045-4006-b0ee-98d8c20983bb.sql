-- Allow anon + authenticated users to read only ACTIVE inventory rows.
-- Admin-only write policies (INSERT/UPDATE/DELETE) are preserved.
DROP POLICY IF EXISTS "Public can view active inventory" ON public.inventory_items;
CREATE POLICY "Public can view active inventory"
  ON public.inventory_items
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

GRANT SELECT ON public.inventory_items TO anon;
GRANT SELECT ON public.inventory_items TO authenticated;