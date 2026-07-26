-- Email send log
CREATE TABLE public.email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  provider_id TEXT,
  error_message TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  triggered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_log_created ON public.email_log(created_at DESC);
CREATE INDEX idx_email_log_template ON public.email_log(template);
CREATE INDEX idx_email_log_status ON public.email_log(status);
CREATE INDEX idx_email_log_recipient ON public.email_log(recipient);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email log"
  ON public.email_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert email log"
  ON public.email_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete email log"
  ON public.email_log FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Prevent duplicate quote expiry reminders
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;