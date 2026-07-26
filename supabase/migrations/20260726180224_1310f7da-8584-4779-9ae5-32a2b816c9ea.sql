-- Extend orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'moyasar',
  provider_ref text UNIQUE,
  method text,
  amount_sar numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'initiated',
  failure_reason text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Customers can see payments on their own orders
CREATE POLICY "payments_owner_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND o.user_id = auth.uid()
    )
  );

-- Staff read
CREATE POLICY "payments_staff_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'accountant')
    OR public.has_role(auth.uid(),'manager')
  );

-- INSERT/UPDATE only via service role (Edge Functions). No policy for anon/authenticated writes.

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-release reservations on payment failure
CREATE OR REPLACE FUNCTION public.trg_release_on_payment_failure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('failed','cancelled','expired')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
  THEN
    PERFORM public.release_order_reservations(NEW.order_id);
    UPDATE public.orders
       SET payment_status = 'failed',
           status = CASE WHEN status IN ('pending','awaiting_payment') THEN 'cancelled' ELSE status END
     WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_payments_failure_release
  AFTER INSERT OR UPDATE OF status ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_release_on_payment_failure();