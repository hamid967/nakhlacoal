-- Phase 10: Intelligence & Automation tables

-- 1) daily_kpi_snapshots
CREATE TABLE public.daily_kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL UNIQUE,
  revenue_sar numeric(14,2) NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  aov_sar numeric(14,2) NOT NULL DEFAULT 0,
  refunds_sar numeric(14,2) NOT NULL DEFAULT 0,
  new_customers integer NOT NULL DEFAULT 0,
  conversion_pct numeric(5,2) NOT NULL DEFAULT 0,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_kpi_snapshots TO authenticated;
GRANT ALL ON public.daily_kpi_snapshots TO service_role;
ALTER TABLE public.daily_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kpi_read_privileged" ON public.daily_kpi_snapshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant'));
CREATE TRIGGER trg_kpi_updated BEFORE UPDATE ON public.daily_kpi_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2) customer_segments
CREATE TABLE public.customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rfm_score integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'new',
  ltv_sar numeric(14,2) NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  last_order_at timestamptz,
  churn_risk numeric(4,3) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_segments TO authenticated;
GRANT ALL ON public.customer_segments TO service_role;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "segments_read_privileged" ON public.customer_segments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant')
      OR user_id = auth.uid());
CREATE TRIGGER trg_segments_updated BEFORE UPDATE ON public.customer_segments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) product_intelligence
CREATE TABLE public.product_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL UNIQUE REFERENCES public.product_variants(id) ON DELETE CASCADE,
  velocity_30d numeric(12,3) NOT NULL DEFAULT 0,
  days_of_cover numeric(8,2),
  abc_class text NOT NULL DEFAULT 'C',
  reorder_point integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_intelligence TO authenticated;
GRANT ALL ON public.product_intelligence TO service_role;
ALTER TABLE public.product_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prodintel_read_privileged" ON public.product_intelligence FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'warehouse'));
CREATE TRIGGER trg_prodintel_updated BEFORE UPDATE ON public.product_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) automation_rules
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  throttle_seconds integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  run_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_rules TO authenticated;
GRANT ALL ON public.automation_rules TO service_role;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_admin_manage" ON public.automation_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager'));
CREATE TRIGGER trg_rules_updated BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5) automation_runs
CREATE TABLE public.automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid,
  status text NOT NULL DEFAULT 'pending',
  log jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.automation_runs TO authenticated;
GRANT ALL ON public.automation_runs TO service_role;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs_read_admin" ON public.automation_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager'));
CREATE INDEX idx_automation_runs_rule ON public.automation_runs(rule_id, created_at DESC);

-- 6) Nightly rollup function (SECURITY DEFINER; called by pg_cron)
CREATE OR REPLACE FUNCTION public.compute_daily_kpi(_day date DEFAULT (now() AT TIME ZONE 'Asia/Riyadh')::date - 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _revenue numeric := 0;
  _orders integer := 0;
  _aov numeric := 0;
  _refunds numeric := 0;
  _new integer := 0;
BEGIN
  SELECT COALESCE(SUM(grand_total_sar),0), COUNT(*)
    INTO _revenue, _orders
  FROM public.orders
  WHERE (created_at AT TIME ZONE 'Asia/Riyadh')::date = _day
    AND status NOT IN ('cancelled','failed','expired');

  IF _orders > 0 THEN _aov := _revenue / _orders; END IF;

  SELECT COALESCE(SUM(refunded_amount_sar),0) INTO _refunds
  FROM public.payments
  WHERE (created_at AT TIME ZONE 'Asia/Riyadh')::date = _day
    AND status = 'refunded';

  SELECT COUNT(*) INTO _new
  FROM public.profiles
  WHERE (created_at AT TIME ZONE 'Asia/Riyadh')::date = _day;

  INSERT INTO public.daily_kpi_snapshots
    (day, revenue_sar, orders_count, aov_sar, refunds_sar, new_customers)
  VALUES
    (_day, _revenue, _orders, _aov, _refunds, _new)
  ON CONFLICT (day) DO UPDATE
    SET revenue_sar = EXCLUDED.revenue_sar,
        orders_count = EXCLUDED.orders_count,
        aov_sar = EXCLUDED.aov_sar,
        refunds_sar = EXCLUDED.refunds_sar,
        new_customers = EXCLUDED.new_customers,
        updated_at = now();
END $$;

-- 7) Customer segmentation (simple RFM)
CREATE OR REPLACE FUNCTION public.compute_customer_segments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer := 0;
BEGIN
  WITH agg AS (
    SELECT user_id,
           COUNT(*)::int AS orders_count,
           COALESCE(SUM(grand_total_sar),0) AS ltv,
           MAX(created_at) AS last_order
    FROM public.orders
    WHERE user_id IS NOT NULL AND status NOT IN ('cancelled','failed','expired')
    GROUP BY user_id
  ), scored AS (
    SELECT user_id, orders_count, ltv, last_order,
      LEAST(5, GREATEST(1, 6 - EXTRACT(days FROM (now() - last_order))::int / 30)) AS r,
      NTILE(5) OVER (ORDER BY orders_count) AS f,
      NTILE(5) OVER (ORDER BY ltv) AS m
    FROM agg
  )
  INSERT INTO public.customer_segments
    (user_id, rfm_score, tier, ltv_sar, orders_count, last_order_at, churn_risk)
  SELECT user_id,
         (r*100 + f*10 + m) AS rfm_score,
         CASE
           WHEN m >= 4 AND f >= 4 THEN 'champion'
           WHEN m >= 4 THEN 'high_value'
           WHEN f >= 4 THEN 'loyal'
           WHEN r <= 2 THEN 'at_risk'
           ELSE 'regular'
         END,
         ltv, orders_count, last_order,
         CASE WHEN r <= 2 THEN 0.7 WHEN r = 3 THEN 0.4 ELSE 0.1 END
    FROM scored
  ON CONFLICT (user_id) DO UPDATE
    SET rfm_score = EXCLUDED.rfm_score,
        tier = EXCLUDED.tier,
        ltv_sar = EXCLUDED.ltv_sar,
        orders_count = EXCLUDED.orders_count,
        last_order_at = EXCLUDED.last_order_at,
        churn_risk = EXCLUDED.churn_risk,
        updated_at = now();
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END $$;

-- 8) Product intelligence (velocity + ABC + days-of-cover)
CREATE OR REPLACE FUNCTION public.compute_product_intelligence()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer := 0;
BEGIN
  WITH sales AS (
    SELECT oi.variant_id,
           COALESCE(SUM(oi.quantity),0) AS sold_30d,
           COALESCE(SUM(oi.quantity * oi.unit_price_sar),0) AS revenue_30d
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.created_at >= now() - interval '30 days'
      AND o.status NOT IN ('cancelled','failed','expired')
      AND oi.variant_id IS NOT NULL
    GROUP BY oi.variant_id
  ), ranked AS (
    SELECT variant_id, sold_30d, revenue_30d,
      SUM(revenue_30d) OVER () AS total_rev,
      SUM(revenue_30d) OVER (ORDER BY revenue_30d DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_rev
    FROM sales
  )
  INSERT INTO public.product_intelligence
    (variant_id, velocity_30d, days_of_cover, abc_class, reorder_point, computed_at)
  SELECT r.variant_id,
         (r.sold_30d / 30.0)::numeric AS velocity,
         CASE WHEN r.sold_30d > 0
              THEN (COALESCE(pv.stock,0) - COALESCE(pv.reserved_qty,0))::numeric / (r.sold_30d / 30.0)
              ELSE NULL END,
         CASE
           WHEN r.total_rev = 0 THEN 'C'
           WHEN r.cum_rev / NULLIF(r.total_rev,0) <= 0.8 THEN 'A'
           WHEN r.cum_rev / NULLIF(r.total_rev,0) <= 0.95 THEN 'B'
           ELSE 'C'
         END,
         CEIL((r.sold_30d / 30.0) * 7)::int, -- 7 days safety
         now()
    FROM ranked r
    JOIN public.product_variants pv ON pv.id = r.variant_id
  ON CONFLICT (variant_id) DO UPDATE
    SET velocity_30d = EXCLUDED.velocity_30d,
        days_of_cover = EXCLUDED.days_of_cover,
        abc_class = EXCLUDED.abc_class,
        reorder_point = EXCLUDED.reorder_point,
        computed_at = now(),
        updated_at = now();
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END $$;

-- 9) Cron: nightly at 03:00 KSA (00:00 UTC)
SELECT cron.schedule(
  'phase10-nightly-rollup',
  '0 0 * * *',
  $$SELECT public.compute_daily_kpi();
    SELECT public.compute_customer_segments();
    SELECT public.compute_product_intelligence();$$
);