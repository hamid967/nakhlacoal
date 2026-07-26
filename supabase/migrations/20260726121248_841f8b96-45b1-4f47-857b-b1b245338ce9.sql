ALTER TABLE public.link_preview_checks
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS batch_id uuid;

CREATE INDEX IF NOT EXISTS link_preview_checks_batch_id_idx
  ON public.link_preview_checks (batch_id);
CREATE INDEX IF NOT EXISTS link_preview_checks_source_created_at_idx
  ON public.link_preview_checks (source, created_at DESC);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;