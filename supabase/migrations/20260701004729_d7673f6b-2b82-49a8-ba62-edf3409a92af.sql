
CREATE POLICY "trademark_logos_admin_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'trademark-logos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')))
WITH CHECK (bucket_id = 'trademark-logos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "trademark_logos_public_read" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'trademark-logos');
