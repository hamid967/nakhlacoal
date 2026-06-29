
-- Restrict public access to sensitive owner/address fields on trademarks.
-- Public users can read only safe brand fields via a view; owner/address/registration
-- remain readable to admins on the base table.

DROP POLICY IF EXISTS "Public can read active trademarks" ON public.trademarks;

CREATE POLICY "Authenticated can read active trademarks"
  ON public.trademarks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Public-safe view: excludes owner_ar, address_ar, country_ar, registration_no
CREATE OR REPLACE VIEW public.trademarks_public
WITH (security_invoker = on) AS
  SELECT
    id, name_ar, name_en, nice_class,
    filed_hijri, registered_hijri, expires_hijri,
    description_ar, goods_ar, colors, sort_order, is_active, updated_at
  FROM public.trademarks
  WHERE is_active = true;

GRANT SELECT ON public.trademarks_public TO anon, authenticated;
