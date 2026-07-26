ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS auto_admin_quote_alert boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_notify_email text;

UPDATE public.email_settings SET auto_admin_quote_alert = true WHERE id = true AND auto_admin_quote_alert IS NULL;

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_quote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enabled boolean;
BEGIN
  SELECT auto_admin_quote_alert INTO _enabled FROM public.email_settings WHERE id = true;
  IF _enabled IS NOT TRUE THEN RETURN NEW; END IF;

  PERFORM net.http_post(
    url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/notify-admin-new-quote',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
    ),
    body := jsonb_build_object('quoteId', NEW.id::text)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_notify_admin_new_quote] %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_notify_admin_new_quote() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS notify_admin_new_quote ON public.quote_requests;
CREATE TRIGGER notify_admin_new_quote
AFTER INSERT ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_admin_new_quote();