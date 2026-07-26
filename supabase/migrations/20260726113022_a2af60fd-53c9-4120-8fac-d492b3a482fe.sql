
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS auto_invoice_receipt boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.trg_send_invoice_receipt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _enabled boolean;
  _should boolean := false;
BEGIN
  SELECT auto_invoice_receipt INTO _enabled FROM public.email_settings WHERE id = true;
  IF _enabled IS NOT TRUE THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.status,'issued') IN ('issued','paid') THEN
      _should := true;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (OLD.status IS DISTINCT FROM NEW.status)
       AND NEW.status IN ('issued','paid') THEN
      _should := true;
    END IF;
  END IF;

  IF NOT _should THEN RETURN NEW; END IF;

  PERFORM net.http_post(
    url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/send-invoice-receipt',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
    ),
    body := jsonb_build_object('invoiceId', NEW.id::text)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_send_invoice_receipt] %', SQLERRM;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS invoices_send_receipt ON public.invoices;
CREATE TRIGGER invoices_send_receipt
AFTER INSERT OR UPDATE OF status ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.trg_send_invoice_receipt();
