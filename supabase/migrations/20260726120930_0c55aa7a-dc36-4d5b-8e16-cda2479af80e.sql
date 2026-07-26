
CREATE TABLE public.link_preview_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  tool text NOT NULL DEFAULT 'server',
  status text NOT NULL DEFAULT 'ok',
  http_status int,
  og_title text,
  og_description text,
  og_image text,
  og_url text,
  og_type text,
  twitter_card text,
  twitter_image text,
  canonical text,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw jsonb,
  note text,
  checked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX link_preview_checks_created_at_idx ON public.link_preview_checks (created_at DESC);
CREATE INDEX link_preview_checks_url_idx        ON public.link_preview_checks (url);

GRANT SELECT, INSERT, DELETE ON public.link_preview_checks TO authenticated;
GRANT ALL ON public.link_preview_checks TO service_role;

ALTER TABLE public.link_preview_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "link_preview_checks_admin_select"
  ON public.link_preview_checks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "link_preview_checks_admin_insert"
  ON public.link_preview_checks FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "link_preview_checks_admin_delete"
  ON public.link_preview_checks FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
