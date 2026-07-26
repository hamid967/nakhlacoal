-- 1) product_variants.reserved_qty
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS reserved_qty integer NOT NULL DEFAULT 0
    CHECK (reserved_qty >= 0);

-- 2) orders: pricing_snapshot + legal_accepted_at
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pricing_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS legal_accepted_at timestamptz;

-- 3) stock_reservations table
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  session_id text,
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  qty integer NOT NULL CHECK (qty > 0),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  released boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_reservations_variant_idx ON public.stock_reservations (variant_id) WHERE released = false;
CREATE INDEX IF NOT EXISTS stock_reservations_expires_idx ON public.stock_reservations (expires_at) WHERE released = false;
CREATE INDEX IF NOT EXISTS stock_reservations_order_idx ON public.stock_reservations (order_id);

GRANT SELECT ON public.stock_reservations TO authenticated;
GRANT ALL ON public.stock_reservations TO service_role;

ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sr_admin_all ON public.stock_reservations;
CREATE POLICY sr_admin_all ON public.stock_reservations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

DROP POLICY IF EXISTS sr_warehouse_read ON public.stock_reservations;
CREATE POLICY sr_warehouse_read ON public.stock_reservations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'warehouse'));

-- 4) Helper: release reservations for an order (idempotent).
CREATE OR REPLACE FUNCTION public.release_order_reservations(_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer := 0;
BEGIN
  WITH freed AS (
    UPDATE public.stock_reservations sr
       SET released = true
     WHERE sr.order_id = _order_id AND sr.released = false
   RETURNING sr.variant_id, sr.qty
  ), upd AS (
    UPDATE public.product_variants pv
       SET reserved_qty = GREATEST(pv.reserved_qty - f.qty, 0)
      FROM freed f
     WHERE pv.id = f.variant_id
    RETURNING 1
  )
  SELECT COUNT(*) INTO _count FROM upd;
  RETURN _count;
END;
$$;

-- 5) Cron-friendly: expire stale reservations.
CREATE OR REPLACE FUNCTION public.expire_stock_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer := 0;
BEGIN
  WITH freed AS (
    UPDATE public.stock_reservations sr
       SET released = true
     WHERE sr.released = false AND sr.expires_at < now()
   RETURNING sr.variant_id, sr.qty
  ), upd AS (
    UPDATE public.product_variants pv
       SET reserved_qty = GREATEST(pv.reserved_qty - f.qty, 0)
      FROM freed f
     WHERE pv.id = f.variant_id
    RETURNING 1
  )
  SELECT COUNT(*) INTO _count FROM upd;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.release_order_reservations(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.expire_stock_reservations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_order_reservations(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.expire_stock_reservations() TO service_role;

-- 6) When an order is cancelled, auto-release its reservations.
CREATE OR REPLACE FUNCTION public.trg_release_on_order_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('cancelled','expired','failed')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.release_order_reservations(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_release_reservations ON public.orders;
CREATE TRIGGER orders_release_reservations
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.trg_release_on_order_cancel();