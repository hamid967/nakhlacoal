
-- 1) Track alerts sent per zatca invoice
ALTER TABLE public.zatca_invoices
  ADD COLUMN IF NOT EXISTS alerted_at timestamptz,
  ADD COLUMN IF NOT EXISTS alert_count integer NOT NULL DEFAULT 0;

-- 2) Settings for the alerts
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS auto_zatca_failure_alert boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS zatca_alert_threshold integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS slack_webhook_url text;

-- 3) Trigger that fires the alert once per failure streak
CREATE OR REPLACE FUNCTION public.trg_zatca_failure_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enabled boolean;
  _threshold integer;
BEGIN
  SELECT auto_zatca_failure_alert, COALESCE(zatca_alert_threshold, 3)
    INTO _enabled, _threshold
    FROM public.email_settings WHERE id = true;

  IF _enabled IS NOT TRUE THEN RETURN NEW; END IF;

  -- Only alert on failed/rejected AFTER threshold attempts, and only if not
  -- already alerted for the current failure streak.
  IF NEW.status IN ('failed','rejected')
     AND COALESCE(NEW.attempts,0) >= _threshold
     AND (NEW.alerted_at IS NULL OR NEW.status IS DISTINCT FROM OLD.status)
  THEN
    PERFORM net.http_post(
      url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/zatca-alert-failure',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
      ),
      body := jsonb_build_object('zatcaInvoiceId', NEW.id::text)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_zatca_failure_alert] %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_zatca_failure_alert ON public.zatca_invoices;
CREATE TRIGGER trg_zatca_failure_alert
AFTER INSERT OR UPDATE OF status, attempts ON public.zatca_invoices
FOR EACH ROW EXECUTE FUNCTION public.trg_zatca_failure_alert();

REVOKE EXECUTE ON FUNCTION public.trg_zatca_failure_alert() FROM PUBLIC, anon, authenticated;
