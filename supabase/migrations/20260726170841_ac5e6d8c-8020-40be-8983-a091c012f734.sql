
-- 1) Role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_rep';

-- Commit the enum add before using it below
COMMIT;
BEGIN;

-- 2) wholesale_accounts
CREATE TABLE public.wholesale_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  cr_number text,
  vat_number text,
  contact_name text,
  contact_email text,
  contact_phone text,
  credit_limit_sar numeric(14,2) NOT NULL DEFAULT 0,
  payment_terms text NOT NULL DEFAULT 'prepaid',
  sales_rep_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  lead_id uuid REFERENCES public.wholesale_leads(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wa_status_chk CHECK (status IN ('pending','active','suspended','closed')),
  CONSTRAINT wa_terms_chk  CHECK (payment_terms IN ('prepaid','net15','net30','net45','net60'))
);
CREATE INDEX wa_user_idx     ON public.wholesale_accounts(user_id);
CREATE INDEX wa_salesrep_idx ON public.wholesale_accounts(sales_rep_id);
CREATE INDEX wa_status_idx   ON public.wholesale_accounts(status);

GRANT SELECT, INSERT, UPDATE ON public.wholesale_accounts TO authenticated;
GRANT ALL ON public.wholesale_accounts TO service_role;
ALTER TABLE public.wholesale_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_admin_all ON public.wholesale_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY wa_owner_read ON public.wholesale_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY wa_rep_read ON public.wholesale_accounts FOR SELECT TO authenticated
  USING (sales_rep_id = auth.uid() OR public.has_role(auth.uid(),'sales_rep'));

CREATE TRIGGER wa_updated BEFORE UPDATE ON public.wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) wholesale_price_tiers
CREATE TABLE public.wholesale_price_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.wholesale_accounts(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  discount_pct numeric(5,2),
  fixed_price_sar numeric(10,2),
  min_qty integer NOT NULL DEFAULT 1,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wpt_scope_chk CHECK ((variant_id IS NOT NULL) OR (category_id IS NOT NULL)),
  CONSTRAINT wpt_price_chk CHECK ((discount_pct IS NOT NULL) OR (fixed_price_sar IS NOT NULL)),
  CONSTRAINT wpt_pct_range CHECK (discount_pct IS NULL OR (discount_pct >= 0 AND discount_pct <= 100))
);
CREATE INDEX wpt_account_idx  ON public.wholesale_price_tiers(account_id);
CREATE INDEX wpt_variant_idx  ON public.wholesale_price_tiers(variant_id);
CREATE INDEX wpt_category_idx ON public.wholesale_price_tiers(category_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wholesale_price_tiers TO authenticated;
GRANT ALL ON public.wholesale_price_tiers TO service_role;
ALTER TABLE public.wholesale_price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY wpt_admin_all ON public.wholesale_price_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY wpt_owner_read ON public.wholesale_price_tiers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.wholesale_accounts a
                 WHERE a.id = wholesale_price_tiers.account_id
                   AND (a.user_id = auth.uid() OR a.sales_rep_id = auth.uid())));

CREATE TRIGGER wpt_updated BEFORE UPDATE ON public.wholesale_price_tiers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) wholesale_statements
CREATE TABLE public.wholesale_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.wholesale_accounts(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_balance_sar numeric(14,2) NOT NULL DEFAULT 0,
  invoiced_sar numeric(14,2) NOT NULL DEFAULT 0,
  paid_sar numeric(14,2) NOT NULL DEFAULT 0,
  closing_balance_sar numeric(14,2) NOT NULL DEFAULT 0,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, period_start, period_end)
);
CREATE INDEX ws_account_idx ON public.wholesale_statements(account_id);

GRANT SELECT, INSERT, UPDATE ON public.wholesale_statements TO authenticated;
GRANT ALL ON public.wholesale_statements TO service_role;
ALTER TABLE public.wholesale_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY ws_admin_all ON public.wholesale_statements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY ws_owner_read ON public.wholesale_statements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.wholesale_accounts a
                 WHERE a.id = wholesale_statements.account_id
                   AND (a.user_id = auth.uid() OR a.sales_rep_id = auth.uid())));

CREATE TRIGGER ws_updated BEFORE UPDATE ON public.wholesale_statements
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5) Link columns
ALTER TABLE public.orders         ADD COLUMN IF NOT EXISTS wholesale_account_id uuid REFERENCES public.wholesale_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS wholesale_account_id uuid REFERENCES public.wholesale_accounts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS orders_wa_idx ON public.orders(wholesale_account_id);
CREATE INDEX IF NOT EXISTS qr_wa_idx     ON public.quote_requests(wholesale_account_id);

-- 6) RPCs
CREATE OR REPLACE FUNCTION public.get_wholesale_price(_variant_id uuid, _qty integer DEFAULT 1)
RETURNS TABLE(price_sar numeric, tier_id uuid, source text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _acct uuid;
  _base numeric;
  _cat  uuid;
BEGIN
  SELECT id INTO _acct FROM public.wholesale_accounts
   WHERE user_id = auth.uid() AND status = 'active' LIMIT 1;

  SELECT v.price, p.category_id INTO _base, _cat
    FROM public.product_variants v
    JOIN public.products p ON p.id = v.product_id
   WHERE v.id = _variant_id;

  IF _acct IS NULL OR _base IS NULL THEN
    RETURN QUERY SELECT _base, NULL::uuid, 'base'::text;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(t.fixed_price_sar,
             ROUND(_base * (1 - COALESCE(t.discount_pct,0)/100.0), 2)) AS price_sar,
    t.id AS tier_id,
    'wholesale'::text AS source
  FROM public.wholesale_price_tiers t
  WHERE t.account_id = _acct
    AND (t.variant_id = _variant_id OR t.category_id = _cat)
    AND t.min_qty <= _qty
    AND (t.valid_until IS NULL OR t.valid_until > now())
    AND t.valid_from <= now()
  ORDER BY
    CASE WHEN t.variant_id IS NOT NULL THEN 0 ELSE 1 END,
    COALESCE(t.fixed_price_sar, _base * (1 - COALESCE(t.discount_pct,0)/100.0)) ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT _base, NULL::uuid, 'base'::text;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.get_wholesale_price(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_wholesale_price(uuid, integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_account_balance(_account_id uuid)
RETURNS TABLE(credit_limit_sar numeric, outstanding_sar numeric, available_sar numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _limit numeric := 0;
  _out   numeric := 0;
  _uid   uuid;
  _rep   uuid;
BEGIN
  SELECT credit_limit_sar, user_id, sales_rep_id INTO _limit, _uid, _rep
    FROM public.wholesale_accounts WHERE id = _account_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'account_not_found'; END IF;

  IF NOT (public.has_role(auth.uid(),'admin')
       OR public.has_role(auth.uid(),'super_admin')
       OR public.has_role(auth.uid(),'manager')
       OR public.has_role(auth.uid(),'accountant')
       OR _uid = auth.uid()
       OR _rep = auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT COALESCE(SUM(grand_total_sar),0) INTO _out
    FROM public.invoices
   WHERE status = 'issued'
     AND customer_user_id = _uid;

  RETURN QUERY SELECT _limit, _out, GREATEST(_limit - _out, 0);
END $$;

REVOKE ALL ON FUNCTION public.get_account_balance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_account_balance(uuid) TO authenticated, service_role;

-- 7) Auto-provision account when lead is approved
CREATE OR REPLACE FUNCTION public.trg_wholesale_lead_approved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  IF NEW.status = 'approved' AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(NEW.email) LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM public.wholesale_accounts WHERE lead_id = NEW.id) THEN
      INSERT INTO public.wholesale_accounts
        (user_id, company_name, contact_name, contact_email, contact_phone,
         status, approved_at, lead_id, notes)
      VALUES
        (_uid, NEW.company, NEW.contact_name, NEW.email, NEW.phone,
         CASE WHEN _uid IS NOT NULL THEN 'active' ELSE 'pending' END,
         now(), NEW.id, NEW.notes);
    END IF;
    IF _uid IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'wholesale')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS wl_on_approved ON public.wholesale_leads;
CREATE TRIGGER wl_on_approved AFTER INSERT OR UPDATE OF status ON public.wholesale_leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_wholesale_lead_approved();

-- 8) Allow accepted-lead status value
DO $$
BEGIN
  -- widen status if constrained; here it's free text so nothing to do
  NULL;
END $$;

COMMIT;
