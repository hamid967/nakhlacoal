
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS unit_price_sar numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_sar    numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_rate        numeric(5,4)  DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS vat_amount_sar  numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sar       numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grand_total_sar numeric(14,2) DEFAULT 0;

CREATE OR REPLACE FUNCTION public.calc_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.vat_rate IS NULL THEN NEW.vat_rate := 0.15; END IF;
  IF NEW.unit_price_sar IS NULL THEN NEW.unit_price_sar := 0; END IF;
  NEW.subtotal_sar    := ROUND(COALESCE(NEW.quantity,0) * NEW.unit_price_sar, 2);
  NEW.total_sar       := NEW.subtotal_sar;
  NEW.vat_amount_sar  := ROUND(NEW.subtotal_sar * NEW.vat_rate, 2);
  NEW.grand_total_sar := ROUND(NEW.subtotal_sar + NEW.vat_amount_sar, 2);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calc_order_totals ON public.orders;
CREATE TRIGGER trg_calc_order_totals
BEFORE INSERT OR UPDATE OF quantity, unit_price_sar, vat_rate
ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.calc_order_totals();
