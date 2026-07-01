
DROP POLICY IF EXISTS "Anyone can insert vitals" ON public.web_vitals;

CREATE POLICY "Anyone can insert valid vitals"
  ON public.web_vitals FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    metric_name IN ('LCP','CLS','INP','FCP','TTFB')
    AND metric_value >= 0
    AND metric_value < 600000
    AND length(path) <= 512
    AND (user_agent IS NULL OR length(user_agent) <= 512)
    AND (session_id IS NULL OR length(session_id) <= 64)
  );
