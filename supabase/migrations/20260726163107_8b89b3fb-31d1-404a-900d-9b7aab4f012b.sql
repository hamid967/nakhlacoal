CREATE OR REPLACE FUNCTION public.get_quote_status(_id uuid, _phone text)
RETURNS TABLE (
  id uuid,
  status text,
  product text,
  quantity numeric,
  unit text,
  quoted_price_sar numeric,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.status, q.product, q.quantity, q.unit,
         q.quoted_price_sar, q.created_at, q.updated_at
  FROM public.quote_requests q
  WHERE q.id = _id
    AND _phone IS NOT NULL
    AND length(regexp_replace(_phone, '\D', '', 'g')) >= 7
    AND right(regexp_replace(q.phone, '\D', '', 'g'), 7)
      = right(regexp_replace(_phone, '\D', '', 'g'), 7)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_quote_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_status(uuid, text) TO anon, authenticated;