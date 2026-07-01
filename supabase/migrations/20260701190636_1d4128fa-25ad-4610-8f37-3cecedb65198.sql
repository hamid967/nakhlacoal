CREATE TABLE public.chat_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_memory TO authenticated;
GRANT ALL ON public.chat_memory TO service_role;

ALTER TABLE public.chat_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own memory read" ON public.chat_memory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own memory write" ON public.chat_memory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own memory update" ON public.chat_memory FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own memory delete" ON public.chat_memory FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_chat_memory_updated_at BEFORE UPDATE ON public.chat_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS summary text;