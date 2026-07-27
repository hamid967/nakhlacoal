
-- ============================================================
-- PHASE 8 — Omnichannel Retail & Operations
-- 12 tables: POS (3), WMS (3), WhatsApp (2), Push (1), Support (2), Returns (2)
-- ============================================================

-- ---------- POS ----------
CREATE TABLE public.pos_registers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  cash_float_sar NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_registers TO authenticated;
GRANT ALL ON public.pos_registers TO service_role;
ALTER TABLE public.pos_registers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pos_registers_staff_read" ON public.pos_registers FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'warehouse'));
CREATE POLICY "pos_registers_admin_write" ON public.pos_registers FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager'));
CREATE TRIGGER trg_pos_registers_updated BEFORE UPDATE ON public.pos_registers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pos_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  register_id UUID NOT NULL REFERENCES public.pos_registers(id) ON DELETE RESTRICT,
  cashier_id UUID REFERENCES auth.users(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_cash_sar NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_cash_sar NUMERIC(12,2),
  sales_total_sar NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','void')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pos_shifts TO authenticated;
GRANT ALL ON public.pos_shifts TO service_role;
ALTER TABLE public.pos_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pos_shifts_staff_all" ON public.pos_shifts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR cashier_id = auth.uid())
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR cashier_id = auth.uid());

CREATE TABLE public.pos_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES public.pos_shifts(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES public.orders(id),
  invoice_id UUID REFERENCES public.invoices(id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','card','stcpay','mada','apple_pay','mixed')),
  amount_sar NUMERIC(12,2) NOT NULL,
  vat_amount_sar NUMERIC(12,2) NOT NULL DEFAULT 0,
  cash_received_sar NUMERIC(12,2),
  change_sar NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pos_sales TO authenticated;
GRANT ALL ON public.pos_sales TO service_role;
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pos_sales_staff_read" ON public.pos_sales FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'accountant'));
CREATE POLICY "pos_sales_staff_insert" ON public.pos_sales FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales'));

-- ---------- WMS ----------
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouses TO authenticated;
GRANT ALL ON public.warehouses TO service_role;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warehouses_staff_read" ON public.warehouses FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'accountant'));
CREATE POLICY "warehouses_admin_write" ON public.warehouses FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager'));
CREATE TRIGGER trg_warehouses_updated BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stock_by_warehouse (
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 0,
  reserved_qty INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (warehouse_id, variant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_by_warehouse TO authenticated;
GRANT ALL ON public.stock_by_warehouse TO service_role;
ALTER TABLE public.stock_by_warehouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sbw_staff_read" ON public.stock_by_warehouse FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse') OR has_role(auth.uid(),'sales'));
CREATE POLICY "sbw_wh_write" ON public.stock_by_warehouse FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse'));
CREATE TRIGGER trg_sbw_updated BEFORE UPDATE ON public.stock_by_warehouse FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('in','out','transfer_in','transfer_out','adjust','return')),
  qty INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stock_movements_variant ON public.stock_movements(variant_id, created_at DESC);
CREATE INDEX idx_stock_movements_wh ON public.stock_movements(warehouse_id, created_at DESC);
GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sm_staff_read" ON public.stock_movements FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse') OR has_role(auth.uid(),'accountant'));
CREATE POLICY "sm_wh_insert" ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse'));

-- ---------- WhatsApp ----------
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','archived')),
  assigned_to UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  order_id UUID REFERENCES public.orders(id),
  quote_id UUID REFERENCES public.quote_requests(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_wa_conv_phone ON public.whatsapp_conversations(customer_phone);
GRANT SELECT, INSERT, UPDATE ON public.whatsapp_conversations TO authenticated;
GRANT ALL ON public.whatsapp_conversations TO service_role;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_conv_staff" ON public.whatsapp_conversations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'));
CREATE TRIGGER trg_wa_conv_updated BEFORE UPDATE ON public.whatsapp_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  template_name TEXT,
  body TEXT,
  media_url TEXT,
  wa_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed')),
  error TEXT,
  sender_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_msg_conv ON public.whatsapp_messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_msg_staff" ON public.whatsapp_messages FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'));

-- ---------- Push subscriptions ----------
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_push_sub_endpoint ON public.push_subscriptions(endpoint);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_sub_own" ON public.push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_push_sub_updated BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Support ----------
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  contact_email TEXT,
  contact_phone TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','order','payment','shipping','product','wholesale','complaint','other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  assigned_to UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  satisfaction_rating SMALLINT CHECK (satisfaction_rating BETWEEN 1 AND 5),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_status ON public.support_tickets(status, priority, created_at DESC);
CREATE INDEX idx_support_user ON public.support_tickets(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_own_read" ON public.support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'));
CREATE POLICY "tickets_own_insert" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "tickets_staff_update" ON public.support_tickets FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR (user_id = auth.uid() AND status <> 'closed'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR user_id = auth.uid());
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_msg_ticket ON public.support_messages(ticket_id, created_at);
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_msg_read" ON public.support_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = support_messages.ticket_id
      AND (t.user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep')))
    AND (is_internal = false OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'))
  );
CREATE POLICY "support_msg_insert" ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = support_messages.ticket_id
      AND (t.user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep')))
    AND (is_internal = false OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'sales') OR has_role(auth.uid(),'sales_rep'))
  );

-- ---------- Returns ----------
CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  user_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','received','refunded','rejected','cancelled')),
  refund_amount_sar NUMERIC(12,2),
  refund_method TEXT,
  notes TEXT,
  admin_notes TEXT,
  credit_note_invoice_id UUID REFERENCES public.invoices(id),
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_returns_status ON public.return_requests(status, created_at DESC);
CREATE INDEX idx_returns_user ON public.return_requests(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "returns_own_read" ON public.return_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse') OR has_role(auth.uid(),'accountant'));
CREATE POLICY "returns_own_insert" ON public.return_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = return_requests.order_id AND o.user_id = auth.uid() AND o.status = 'delivered' AND o.updated_at > (now() - interval '14 days'))
  );
CREATE POLICY "returns_admin_insert" ON public.return_requests FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "returns_staff_update" ON public.return_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse') OR (user_id = auth.uid() AND status = 'requested'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse') OR user_id = auth.uid());
CREATE TRIGGER trg_returns_updated BEFORE UPDATE ON public.return_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id),
  variant_id UUID REFERENCES public.product_variants(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price_sar NUMERIC(12,2) NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new','damaged','used')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_return_items_return ON public.return_items(return_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.return_items TO authenticated;
GRANT ALL ON public.return_items TO service_role;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "return_items_scoped" ON public.return_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.return_requests r WHERE r.id = return_items.return_id
    AND (r.user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.return_requests r WHERE r.id = return_items.return_id
    AND (r.user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'warehouse'))));

-- Seed default warehouse (Jeddah main)
INSERT INTO public.warehouses (name, city, address, is_default, active)
SELECT 'Jeddah Main', 'Jeddah', 'Palm Charcoal Warehouse, Jeddah', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses WHERE is_default = true);
