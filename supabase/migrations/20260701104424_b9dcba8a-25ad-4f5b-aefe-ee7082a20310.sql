
CREATE TABLE IF NOT EXISTS public.rate_limits (
  bucket_key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  hits integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: table is service_role only.

CREATE OR REPLACE FUNCTION public.check_rate_limit(_key text, _max integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _now timestamptz := now();
  _hits integer;
  _window_start timestamptz;
BEGIN
  INSERT INTO public.rate_limits (bucket_key, window_start, hits, updated_at)
  VALUES (_key, _now, 1, _now)
  ON CONFLICT (bucket_key) DO UPDATE
    SET hits = CASE
        WHEN public.rate_limits.window_start < _now - make_interval(secs => _window_seconds) THEN 1
        ELSE public.rate_limits.hits + 1
      END,
      window_start = CASE
        WHEN public.rate_limits.window_start < _now - make_interval(secs => _window_seconds) THEN _now
        ELSE public.rate_limits.window_start
      END,
      updated_at = _now
  RETURNING hits, window_start INTO _hits, _window_start;

  RETURN _hits <= _max;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;
