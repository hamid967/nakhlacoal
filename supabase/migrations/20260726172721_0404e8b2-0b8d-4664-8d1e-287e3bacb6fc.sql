-- ============================================
-- Phase 4: ZATCA Phase-2 e-Invoicing schema
-- ============================================

-- 1) zatca_credentials
CREATE TABLE IF NOT EXISTS public.zatca_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','simulation','production')),
  org_name text NOT NULL,
  org_vat text NOT NULL,
  org_cr text,
  org_address jsonb,
  device_serial text NOT NULL,
  common_name text NOT NULL,
  csr text,
  private_key_encrypted text,
  compliance_csid text,
  compliance_request_id text,
  production_csid text,
  cert_expires_at timestamptz,
  active boolean NOT NULL DEFAULT false,
  onboarding_step text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (environment, device_serial)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.zatca_credentials TO authenticated;
GRANT ALL ON public.zatca_credentials TO service_role;

ALTER TABLE public.zatca_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zatca_credentials_admin_all" ON public.zatca_credentials
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'accountant'));

CREATE TRIGGER trg_zatca_credentials_updated_at
  BEFORE UPDATE ON public.zatca_credentials
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2) zatca_invoices
CREATE TABLE IF NOT EXISTS public.zatca_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  credential_id uuid REFERENCES public.zatca_credentials(id) ON DELETE SET NULL,
  uuid text NOT NULL,
  icv integer NOT NULL,
  pih text NOT NULL,
  hash text NOT NULL,
  xml_signed text,
  qr_base64 text,
  invoice_type text NOT NULL DEFAULT 'standard' CHECK (invoice_type IN ('standard','simplified')),
  invoice_subtype text NOT NULL DEFAULT '388',
  submission_type text NOT NULL CHECK (submission_type IN ('clearance','reporting')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed','cleared','reported','failed','rejected')),
  zatca_response jsonb,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  submitted_at timestamptz,
  cleared_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (credential_id, icv)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.zatca_invoices TO authenticated;
GRANT ALL ON public.zatca_invoices TO service_role;

ALTER TABLE public.zatca_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zatca_invoices_admin_all" ON public.zatca_invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'accountant'));

CREATE INDEX IF NOT EXISTS idx_zatca_invoices_invoice ON public.zatca_invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_zatca_invoices_status ON public.zatca_invoices(status);
CREATE INDEX IF NOT EXISTS idx_zatca_invoices_chain ON public.zatca_invoices(credential_id, icv DESC);

CREATE TRIGGER trg_zatca_invoices_updated_at
  BEFORE UPDATE ON public.zatca_invoices
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) invoices extensions
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS invoice_type text NOT NULL DEFAULT 'standard' CHECK (invoice_type IN ('standard','simplified')),
  ADD COLUMN IF NOT EXISTS invoice_subtype text NOT NULL DEFAULT '388',
  ADD COLUMN IF NOT EXISTS counterparty_vat text,
  ADD COLUMN IF NOT EXISTS counterparty_address jsonb,
  ADD COLUMN IF NOT EXISTS zatca_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS zatca_qr text,
  ADD COLUMN IF NOT EXISTS zatca_uuid text;

-- 4) Helper RPC: get next ICV and previous hash for a device
CREATE OR REPLACE FUNCTION public.zatca_next_icv(_credential_id uuid)
RETURNS TABLE(next_icv integer, previous_hash text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _last_icv integer;
  _last_hash text;
BEGIN
  SELECT icv, hash INTO _last_icv, _last_hash
  FROM public.zatca_invoices
  WHERE credential_id = _credential_id
  ORDER BY icv DESC
  LIMIT 1;

  RETURN QUERY SELECT
    COALESCE(_last_icv, 0) + 1,
    COALESCE(_last_hash, 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==');
END;
$$;

REVOKE ALL ON FUNCTION public.zatca_next_icv(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.zatca_next_icv(uuid) TO authenticated, service_role;

-- 5) Trigger: mark invoice for ZATCA submission on issuance
CREATE OR REPLACE FUNCTION public.trg_queue_zatca_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'issued'
     AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.zatca_status = 'pending'
  THEN
    -- Fire-and-forget HTTP call to the sign+submit function
    PERFORM net.http_post(
      url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/zatca-sign-invoice',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
      ),
      body := jsonb_build_object('invoiceId', NEW.id::text)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_queue_zatca_submission] %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trg_queue_zatca_submission() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_invoices_zatca_queue ON public.invoices;
CREATE TRIGGER trg_invoices_zatca_queue
  AFTER INSERT OR UPDATE OF status ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.trg_queue_zatca_submission();