
-- ============ 1) quote_requests (public quote form) ============
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 2 AND 120),
  company_name text NOT NULL CHECK (length(btrim(company_name)) BETWEEN 2 AND 200),
  phone text NOT NULL CHECK (length(btrim(phone)) BETWEEN 7 AND 25),
  email text,
  product text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0 AND quantity <= 1000000),
  unit text NOT NULL DEFAULT 'كرتون',
  destination text,
  notes text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','under_review','priced','accepted','rejected','converted_to_order')),
  quoted_price_sar numeric,
  admin_notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT INSERT ON public.quote_requests TO anon;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY quote_requests_public_insert ON public.quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(full_name)) BETWEEN 2 AND 120
    AND length(btrim(company_name)) BETWEEN 2 AND 200
    AND length(btrim(phone)) BETWEEN 7 AND 25
    AND (user_id IS NULL OR user_id = auth.uid())
  );

CREATE POLICY quote_requests_owner_select ON public.quote_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY quote_requests_admin_all ON public.quote_requests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE TRIGGER quote_requests_touch BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 2) status_history (audit trail for status transitions) ============
CREATE TABLE public.status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('order','quote_request')),
  entity_id uuid NOT NULL,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX status_history_entity_idx ON public.status_history(entity_type, entity_id, created_at DESC);

GRANT SELECT ON public.status_history TO authenticated;
GRANT ALL ON public.status_history TO service_role;

ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY status_history_admin_read ON public.status_history
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY status_history_owner_read ON public.status_history
  FOR SELECT TO authenticated
  USING (
    (entity_type = 'order' AND EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = status_history.entity_id AND o.user_id = auth.uid()
    ))
    OR (entity_type = 'quote_request' AND EXISTS (
      SELECT 1 FROM public.quote_requests q WHERE q.id = status_history.entity_id AND q.user_id = auth.uid()
    ))
  );

-- Trigger: log status transitions for orders
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.status_history (entity_type, entity_id, from_status, to_status, changed_by)
    VALUES ('order', NEW.id, CASE WHEN TG_OP='INSERT' THEN NULL ELSE OLD.status END, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_status_history ON public.orders;
CREATE TRIGGER orders_status_history
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Trigger: log status transitions for quote_requests
CREATE OR REPLACE FUNCTION public.log_quote_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.status_history (entity_type, entity_id, from_status, to_status, changed_by)
    VALUES ('quote_request', NEW.id, CASE WHEN TG_OP='INSERT' THEN NULL ELSE OLD.status END, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS quote_requests_status_history ON public.quote_requests;
CREATE TRIGGER quote_requests_status_history
  AFTER INSERT OR UPDATE OF status ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_quote_status_change();

-- ============ 3) notifications (email send log) ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  entity_type text,
  entity_id uuid,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_admin_read ON public.notifications
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
