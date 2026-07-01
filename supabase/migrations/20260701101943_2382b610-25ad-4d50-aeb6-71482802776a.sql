
CREATE TABLE public.web_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  rating TEXT,
  path TEXT NOT NULL,
  webgl BOOLEAN,
  webgl_reason TEXT,
  navigation_type TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.web_vitals TO anon, authenticated;
GRANT ALL ON public.web_vitals TO service_role;

ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert vitals"
  ON public.web_vitals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read vitals"
  ON public.web_vitals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX idx_web_vitals_created_at ON public.web_vitals (created_at DESC);
CREATE INDEX idx_web_vitals_metric ON public.web_vitals (metric_name, created_at DESC);
