
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS auto_shipment_notification boolean NOT NULL DEFAULT true;

INSERT INTO public.email_settings (id, auto_shipment_notification)
VALUES (true, true)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trg_send_shipment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enabled boolean;
  _should boolean := false;
BEGIN
  SELECT auto_shipment_notification INTO _enabled FROM public.email_settings WHERE id = true;
  IF _enabled IS NOT TRUE THEN RETURN NEW; END IF;
  IF NEW.tracking_no IS NULL OR NEW.tracking_no = '' THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    _should := true;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (OLD.tracking_no IS DISTINCT FROM NEW.tracking_no)
       OR (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('shipped','in_transit','out_for_delivery','delivered'))
    THEN
      _should := true;
    END IF;
  END IF;

  IF NOT _should THEN RETURN NEW; END IF;

  PERFORM net.http_post(
    url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/send-shipment-notification',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
    ),
    body := jsonb_build_object('shipmentId', NEW.id::text, 'status', NEW.status)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_send_shipment_notification] %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shipments_send_notification ON public.shipments;
CREATE TRIGGER shipments_send_notification
  AFTER INSERT OR UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.trg_send_shipment_notification();
