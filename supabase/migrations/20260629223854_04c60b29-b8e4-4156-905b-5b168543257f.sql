ALTER TABLE public.trademarks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trademarks;