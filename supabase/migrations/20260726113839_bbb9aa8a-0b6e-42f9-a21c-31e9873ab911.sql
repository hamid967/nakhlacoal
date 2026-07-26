
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_updates boolean NOT NULL DEFAULT true,
  shipment_updates boolean NOT NULL DEFAULT true,
  invoice_receipts boolean NOT NULL DEFAULT true,
  quote_updates boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,
  unsubscribed_all boolean NOT NULL DEFAULT false,
  unsubscribe_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_preferences_email_lower_idx ON public.email_preferences ((lower(email)));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_preferences TO authenticated;
GRANT SELECT, UPDATE ON public.email_preferences TO anon;
GRANT ALL ON public.email_preferences TO service_role;

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_prefs_admin_all ON public.email_preferences
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY email_prefs_own_select ON public.email_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

CREATE POLICY email_prefs_own_upsert ON public.email_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

CREATE POLICY email_prefs_own_update ON public.email_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  WITH CHECK (user_id = auth.uid() OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

CREATE TRIGGER email_preferences_updated
BEFORE UPDATE ON public.email_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Consent check used by send-* edge functions (service role).
CREATE OR REPLACE FUNCTION public.email_opted_in(_email text, _category text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.email_preferences%ROWTYPE;
BEGIN
  IF _email IS NULL OR _email = '' THEN RETURN false; END IF;
  SELECT * INTO r FROM public.email_preferences WHERE lower(email) = lower(_email) LIMIT 1;
  IF NOT FOUND THEN
    -- No explicit prefs: allow all except marketing (double opt-in required).
    RETURN _category <> 'marketing';
  END IF;
  IF r.unsubscribed_all THEN RETURN false; END IF;
  RETURN CASE _category
    WHEN 'order_updates'    THEN r.order_updates
    WHEN 'shipment_updates' THEN r.shipment_updates
    WHEN 'invoice_receipts' THEN r.invoice_receipts
    WHEN 'quote_updates'    THEN r.quote_updates
    WHEN 'marketing'        THEN r.marketing
    ELSE true
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.email_opted_in(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.email_opted_in(text, text) TO anon, authenticated, service_role;
