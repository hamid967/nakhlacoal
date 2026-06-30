ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items jsonb;
CREATE INDEX IF NOT EXISTS orders_items_gin_idx ON public.orders USING gin (items);