-- Singleton settings table
CREATE TABLE IF NOT EXISTS public.email_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  auto_order_confirmation boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE ON public.email_settings TO authenticated;
GRANT ALL ON public.email_settings TO service_role;

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read email_settings" ON public.email_settings;
CREATE POLICY "Admins read email_settings" ON public.email_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins upsert email_settings" ON public.email_settings;
CREATE POLICY "Admins upsert email_settings" ON public.email_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update email_settings" ON public.email_settings;
CREATE POLICY "Admins update email_settings" ON public.email_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.email_settings (id, auto_order_confirmation)
VALUES (true, true) ON CONFLICT (id) DO NOTHING;

-- Trigger: auto-send order confirmation on new order
CREATE OR REPLACE FUNCTION public.trg_send_order_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enabled boolean;
BEGIN
  SELECT auto_order_confirmation INTO _enabled FROM public.email_settings WHERE id = true;
  IF _enabled IS NOT TRUE THEN RETURN NEW; END IF;
  IF NEW.email IS NULL OR NEW.email = '' THEN RETURN NEW; END IF;

  PERFORM net.http_post(
    url := 'https://qvmytuikwemhmwuevckt.supabase.co/functions/v1/send-order-confirmation',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXl0dWlrd2VtaG13dWV2Y2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzI0NTUsImV4cCI6MjA5ODIwODQ1NX0.TpDSapBAu4L_W214nE-7y3fQ3Ys1pJq3Ds0uYqO36Uo'
    ),
    body := jsonb_build_object('orderId', NEW.id::text)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[trg_send_order_confirmation] %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_send_confirmation ON public.orders;
CREATE TRIGGER orders_send_confirmation
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trg_send_order_confirmation();