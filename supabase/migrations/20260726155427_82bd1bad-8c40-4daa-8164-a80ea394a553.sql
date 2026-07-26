
DROP POLICY IF EXISTS "newsletter_subscribe" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribe" ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (
    email IS NOT NULL AND length(trim(email)) BETWEEN 5 AND 254
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND locale IN ('ar','en')
  );

DROP POLICY IF EXISTS "wholesale_submit" ON public.wholesale_leads;
CREATE POLICY "wholesale_submit" ON public.wholesale_leads FOR INSERT
  WITH CHECK (
    length(trim(company)) BETWEEN 2 AND 200
    AND length(trim(contact_name)) BETWEEN 2 AND 120
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND status = 'new'
  );

DROP POLICY IF EXISTS "export_submit" ON public.export_leads;
CREATE POLICY "export_submit" ON public.export_leads FOR INSERT
  WITH CHECK (
    length(trim(company)) BETWEEN 2 AND 200
    AND length(trim(contact_name)) BETWEEN 2 AND 120
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(country)) BETWEEN 2 AND 80
    AND status = 'new'
  );
