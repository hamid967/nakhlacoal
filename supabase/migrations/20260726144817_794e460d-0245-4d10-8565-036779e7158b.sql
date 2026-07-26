-- 1) Restrict lab_reports public read to authenticated users
DROP POLICY IF EXISTS "Public can read lab reports" ON public.lab_reports;
CREATE POLICY "Authenticated can read lab reports"
  ON public.lab_reports FOR SELECT
  TO authenticated
  USING (true);

-- 2) Revoke EXECUTE on trigger-only SECURITY DEFINER functions from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.trg_send_invoice_receipt() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_invite_quote_customer() FROM PUBLIC, anon, authenticated;