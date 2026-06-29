
CREATE TABLE public.lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code text NOT NULL,
  carbon_pct numeric NOT NULL DEFAULT 85,
  ash_pct numeric NOT NULL DEFAULT 3,
  moisture_pct numeric NOT NULL DEFAULT 6,
  burn_time_min numeric NOT NULL DEFAULT 185,
  max_temp_c numeric NOT NULL DEFAULT 750,
  volatile_pct numeric NOT NULL DEFAULT 6,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lab_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_reports TO authenticated;
GRANT ALL ON public.lab_reports TO service_role;

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read lab reports"
  ON public.lab_reports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage lab reports"
  ON public.lab_reports FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_lab_reports_updated_at
  BEFORE UPDATE ON public.lab_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lab_reports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_reports;

INSERT INTO public.lab_reports (batch_code, carbon_pct, ash_pct, moisture_pct, burn_time_min, max_temp_c, volatile_pct, notes)
VALUES
  ('B-2026-Q2-001', 85.4, 2.9, 5.8, 188, 755, 5.7, 'Latest production batch — Q2 2026'),
  ('B-2026-Q2-000', 84.9, 3.1, 6.1, 183, 748, 6.0, 'Previous batch'),
  ('B-2026-Q1-014', 84.5, 3.3, 6.4, 180, 742, 6.2, NULL);
