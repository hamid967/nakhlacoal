
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  match_pattern text NOT NULL,
  in_stock_kg numeric NOT NULL DEFAULT 0,
  min_order_kg numeric NOT NULL DEFAULT 1,
  lead_days integer NOT NULL DEFAULT 1,
  tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.inventory_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inventory"
  ON public.inventory_items FOR SELECT
  USING (true);

CREATE POLICY "Admins insert inventory"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update inventory"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete inventory"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.inventory_items (slug, label, match_pattern, in_stock_kg, min_order_kg, lead_days, tiers, sort_order) VALUES
('bbq', 'فحم الشواء', 'شواء|bbq', 4200, 5, 1, '[{"minKg":0,"pricePerKg":18},{"minKg":50,"pricePerKg":15},{"minKg":250,"pricePerKg":12},{"minKg":1000,"pricePerKg":10}]'::jsonb, 1),
('coconut', 'فحم جوز الهند / المعسل', 'جوز الهند|coconut|معسل', 2800, 5, 1, '[{"minKg":0,"pricePerKg":32},{"minKg":50,"pricePerKg":28},{"minKg":250,"pricePerKg":24},{"minKg":1000,"pricePerKg":20}]'::jsonb, 2),
('incense', 'فحم البخور', 'بخور|incense', 950, 2, 2, '[{"minKg":0,"pricePerKg":40},{"minKg":25,"pricePerKg":35},{"minKg":100,"pricePerKg":30}]'::jsonb, 3),
('compressed', 'الفحم المضغوط', 'مضغوط|compressed', 1600, 10, 2, '[{"minKg":0,"pricePerKg":14},{"minKg":100,"pricePerKg":11},{"minKg":500,"pricePerKg":9}]'::jsonb, 4),
('export-box', 'علبة التصدير الفاخرة', 'علبة|تصدير|export|box', 320, 1, 3, '[{"minKg":0,"pricePerKg":120},{"minKg":20,"pricePerKg":100},{"minKg":80,"pricePerKg":85}]'::jsonb, 5);
