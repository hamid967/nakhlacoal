
CREATE TABLE public.pending_orders (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  form jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_orders TO authenticated;
GRANT ALL ON public.pending_orders TO service_role;

ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pending order"
  ON public.pending_orders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER pending_orders_updated_at
  BEFORE UPDATE ON public.pending_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
