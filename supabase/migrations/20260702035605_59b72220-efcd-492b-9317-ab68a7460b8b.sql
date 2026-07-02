
-- 1) daily_reports: add primary key `id` and enforce one row per date
ALTER TABLE public.daily_reports
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='daily_reports' AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE public.daily_reports ADD CONSTRAINT daily_reports_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='daily_reports_report_date_key'
  ) THEN
    CREATE UNIQUE INDEX daily_reports_report_date_key ON public.daily_reports (report_date);
  END IF;
END $$;

-- 2) rate_limits: ensure explicit admin-only SELECT policy so bucket keys are not
-- observable by regular authenticated users. RLS is already enabled and there
-- are no INSERT/UPDATE policies for regular users (writes go through the
-- SECURITY DEFINER function `check_rate_limit`).
DROP POLICY IF EXISTS rate_limits_admin_select ON public.rate_limits;
CREATE POLICY rate_limits_admin_select
  ON public.rate_limits
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also add a stable primary key on bucket_key to match the ON CONFLICT usage
-- in check_rate_limit(), if not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='rate_limits' AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE public.rate_limits ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (bucket_key);
  END IF;
END $$;
