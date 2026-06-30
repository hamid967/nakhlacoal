DROP POLICY IF EXISTS "Anyone can read analytics settings" ON public.analytics_settings;

CREATE POLICY "Admins can read analytics settings"
ON public.analytics_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));