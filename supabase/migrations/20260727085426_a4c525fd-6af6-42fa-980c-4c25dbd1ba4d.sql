
-- =========================================================
-- automation_events queue
-- =========================================================
CREATE TABLE public.automation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key text UNIQUE,
  processed_at timestamptz,
  processed_result jsonb,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_automation_events_pending
  ON public.automation_events (created_at) WHERE processed_at IS NULL;
CREATE INDEX idx_automation_events_kind ON public.automation_events (kind);

GRANT SELECT ON public.automation_events TO authenticated;
GRANT ALL ON public.automation_events TO service_role;
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read automation_events"
  ON public.automation_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager'));

-- =========================================================
-- admin_notifications inbox
-- =========================================================
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','success','warning','critical')),
  kind text NOT NULL DEFAULT 'general',
  link text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  read_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_notifications_created ON public.admin_notifications (created_at DESC);
CREATE INDEX idx_admin_notifications_unread ON public.admin_notifications (created_at DESC) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read admin_notifications"
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
      OR public.has_role(auth.uid(),'accountant'));

CREATE POLICY "staff update admin_notifications"
  ON public.admin_notifications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
      OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
      OR public.has_role(auth.uid(),'accountant'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- =========================================================
-- low-stock trigger on product_variants
-- =========================================================
CREATE OR REPLACE FUNCTION public.trg_enqueue_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rp integer;
  _avail integer;
  _dedupe text;
BEGIN
  SELECT reorder_point INTO _rp FROM public.product_intelligence WHERE variant_id = NEW.id;
  IF _rp IS NULL OR _rp <= 0 THEN RETURN NEW; END IF;

  _avail := GREATEST(COALESCE(NEW.stock,0) - COALESCE(NEW.reserved_qty,0), 0);
  IF _avail > _rp THEN RETURN NEW; END IF;

  -- dedupe per variant per day
  _dedupe := 'stock.low:' || NEW.id::text || ':' || to_char(now() AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD');

  INSERT INTO public.automation_events (kind, payload, dedupe_key)
  VALUES (
    'stock.low',
    jsonb_build_object(
      'variant_id', NEW.id,
      'product_id', NEW.product_id,
      'available', _avail,
      'reorder_point', _rp,
      'stock', NEW.stock,
      'reserved_qty', NEW.reserved_qty
    ),
    _dedupe
  )
  ON CONFLICT (dedupe_key) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_enqueue_low_stock] %', SQLERRM;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pv_low_stock ON public.product_variants;
CREATE TRIGGER trg_pv_low_stock
AFTER INSERT OR UPDATE OF stock, reserved_qty ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.trg_enqueue_low_stock();

-- =========================================================
-- abandoned cart sweep
-- =========================================================
CREATE OR REPLACE FUNCTION public.sweep_abandoned_carts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer := 0;
BEGIN
  WITH candidates AS (
    SELECT c.id AS cart_id, c.user_id, c.updated_at,
           (SELECT COUNT(*) FROM public.cart_items ci WHERE ci.cart_id = c.id) AS item_count
      FROM public.carts c
     WHERE c.updated_at < now() - interval '24 hours'
       AND c.updated_at > now() - interval '7 days'
  )
  INSERT INTO public.automation_events (kind, payload, dedupe_key)
  SELECT 'cart.abandoned',
         jsonb_build_object('cart_id', cart_id, 'user_id', user_id, 'items', item_count, 'idle_since', updated_at),
         'cart.abandoned:' || cart_id::text || ':' || to_char(updated_at,'YYYY-MM-DD')
    FROM candidates
   WHERE item_count > 0
  ON CONFLICT (dedupe_key) DO NOTHING;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END $$;

REVOKE EXECUTE ON FUNCTION public.sweep_abandoned_carts() FROM PUBLIC, anon, authenticated;

-- =========================================================
-- pg_cron schedules for the dispatcher + sweeper
-- =========================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'automation-dispatcher-5min') THEN
    PERFORM cron.unschedule('automation-dispatcher-5min');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'abandoned-cart-hourly') THEN
    PERFORM cron.unschedule('abandoned-cart-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'automation-dispatcher-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/automation-dispatcher',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
    ),
    body := jsonb_build_object('trigger','cron')
  );
  $$
);

SELECT cron.schedule(
  'abandoned-cart-hourly',
  '0 * * * *',
  $$ SELECT public.sweep_abandoned_carts(); $$
);
