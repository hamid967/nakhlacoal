
CREATE TABLE public.analytics_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  ga4_measurement_id TEXT,
  gtm_container_id TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.analytics_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.analytics_settings TO authenticated;
GRANT ALL ON public.analytics_settings TO service_role;

ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read analytics settings"
  ON public.analytics_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert analytics settings"
  ON public.analytics_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update analytics settings"
  ON public.analytics_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.analytics_settings (id, enabled) VALUES (true, false)
  ON CONFLICT (id) DO NOTHING;
