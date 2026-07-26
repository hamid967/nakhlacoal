
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS auto_customer_invite boolean NOT NULL DEFAULT true;

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS invited_at timestamptz;

CREATE OR REPLACE FUNCTION public.trg_invite_quote_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enabled boolean;
BEGIN
  SELECT auto_customer_invite INTO _enabled FROM public.email_settings WHERE id = true;
  IF _enabled IS NOT TRUE THEN RETURN NEW; END IF;

  IF NEW.status = 'accepted'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.email IS NOT NULL AND NEW.email <> ''
     AND NEW.invited_at IS NULL
  THEN
    PERFORM net.http_post(
      url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/invite-quote-customer',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
      ),
      body := jsonb_build_object('quoteId', NEW.id::text)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_invite_quote_customer] %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quote_requests_invite_on_accept ON public.quote_requests;
CREATE TRIGGER quote_requests_invite_on_accept
AFTER INSERT OR UPDATE OF status ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.trg_invite_quote_customer();
