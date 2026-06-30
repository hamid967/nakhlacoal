
CREATE SEQUENCE IF NOT EXISTS public.invoice_seq START 1 INCREMENT 1;

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  city text,
  address text,
  commercial_register text,
  vat_number text,
  payment_terms_days int NOT NULL DEFAULT 0,
  credit_limit_sar numeric(14,2) NOT NULL DEFAULT 0,
  balance_sar numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_admin_manager_all" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "customers_accountant_read" ON public.customers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'accountant'));
CREATE POLICY "customers_owner_read" ON public.customers FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INVOICES ============
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE NOT NULL DEFAULT (
    'INV-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.invoice_seq')::text, 6, '0')
  ),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  issue_date date NOT NULL DEFAULT current_date,
  due_date date,
  seller_name text NOT NULL DEFAULT 'فحم النخلة | Palm Charcoal',
  seller_vat_number text NOT NULL DEFAULT '300000000000003',
  seller_cr text,
  seller_address text,
  buyer_name text NOT NULL,
  buyer_vat_number text,
  buyer_address text,
  subtotal_sar numeric(14,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,4) NOT NULL DEFAULT 0.15,
  vat_amount_sar numeric(14,2) NOT NULL DEFAULT 0,
  grand_total_sar numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','issued','paid','void')),
  qr_payload text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_admin_manager_all" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "invoices_accountant_read" ON public.invoices FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'accountant'));
CREATE POLICY "invoices_accountant_update" ON public.invoices FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'accountant'));
CREATE POLICY "invoices_customer_read" ON public.invoices FOR SELECT TO authenticated
  USING (customer_user_id = auth.uid());
CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INVOICE ITEMS ============
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(12,3) NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'kg',
  unit_price_sar numeric(14,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,4) NOT NULL DEFAULT 0.15,
  line_total_sar numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items_admin_manager_all" ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "invoice_items_accountant_read" ON public.invoice_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'accountant'));
CREATE POLICY "invoice_items_customer_read" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.customer_user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ============ SHIPMENTS ============
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  carrier text NOT NULL DEFAULT 'Aramex',
  tracking_no text,
  tracking_url text,
  status text NOT NULL DEFAULT 'preparing'
    CHECK (status IN ('preparing','shipped','out_for_delivery','delivered','returned','cancelled')),
  weight_kg numeric(10,2),
  shipping_cost_sar numeric(12,2) DEFAULT 0,
  origin_city text DEFAULT 'جدة',
  destination_city text,
  destination_address text,
  recipient_name text,
  recipient_phone text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipments_admin_manager_all" ON public.shipments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "shipments_accountant_read" ON public.shipments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'accountant'));
CREATE POLICY "shipments_customer_read" ON public.shipments FOR SELECT TO authenticated
  USING (customer_user_id = auth.uid());
CREATE TRIGGER shipments_updated BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);

-- ============ DAILY REPORTS ============
CREATE TABLE IF NOT EXISTS public.daily_reports (
  report_date date PRIMARY KEY,
  orders_count int NOT NULL DEFAULT 0,
  sales_subtotal_sar numeric(14,2) NOT NULL DEFAULT 0,
  vat_collected_sar numeric(14,2) NOT NULL DEFAULT 0,
  grand_total_sar numeric(14,2) NOT NULL DEFAULT 0,
  new_customers int NOT NULL DEFAULT 0,
  low_stock_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_reports TO authenticated;
GRANT ALL ON public.daily_reports TO service_role;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_reports_staff_read" ON public.daily_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "daily_reports_admin_all" ON public.daily_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER daily_reports_updated BEFORE UPDATE ON public.daily_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Auto-calc triggers ============
CREATE OR REPLACE FUNCTION public.calc_invoice_item_total()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.line_total_sar := ROUND(COALESCE(NEW.quantity,0) * COALESCE(NEW.unit_price_sar,0), 2);
  RETURN NEW;
END;
$$;
CREATE TRIGGER invoice_items_calc BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.calc_invoice_item_total();

CREATE OR REPLACE FUNCTION public.recalc_invoice_totals()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _inv uuid; _subtotal numeric(14,2); _vat_rate numeric(5,4);
BEGIN
  _inv := COALESCE(NEW.invoice_id, OLD.invoice_id);
  SELECT vat_rate INTO _vat_rate FROM public.invoices WHERE id = _inv;
  IF _vat_rate IS NULL THEN _vat_rate := 0.15; END IF;
  SELECT COALESCE(SUM(line_total_sar),0) INTO _subtotal FROM public.invoice_items WHERE invoice_id = _inv;
  UPDATE public.invoices SET
    subtotal_sar    = _subtotal,
    vat_amount_sar  = ROUND(_subtotal * _vat_rate, 2),
    grand_total_sar = ROUND(_subtotal + _subtotal * _vat_rate, 2),
    updated_at      = now()
  WHERE id = _inv;
  RETURN NULL;
END;
$$;
CREATE TRIGGER invoice_items_recalc AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.recalc_invoice_totals();
