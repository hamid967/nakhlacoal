-- Restore invoker semantics on the view (satisfies security_definer_view linter)
ALTER VIEW public.trademarks_public SET (security_invoker = on);

-- Split the FOR ALL admin policy so anon SELECT no longer triggers has_role()
DROP POLICY IF EXISTS "Admins manage trademarks" ON public.trademarks;
CREATE POLICY "Admins insert trademarks" ON public.trademarks
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update trademarks" ON public.trademarks
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete trademarks" ON public.trademarks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Restrict anon to safe columns only (mirrors trademarks_public projection)
REVOKE SELECT ON public.trademarks FROM anon;
GRANT SELECT
  (id, name_ar, name_en, nice_class, filed_hijri, registered_hijri,
   expires_hijri, description_ar, goods_ar, colors, sort_order,
   is_active, updated_at)
  ON public.trademarks TO anon;

-- Allow anon to read active rows; sensitive columns are blocked by the GRANT above
CREATE POLICY "Anon read active trademarks" ON public.trademarks
  FOR SELECT TO anon USING (is_active = true);