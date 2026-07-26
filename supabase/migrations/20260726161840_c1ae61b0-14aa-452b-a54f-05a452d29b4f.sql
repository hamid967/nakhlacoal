DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'articles','categories','certifications','coupons','inventory_items',
    'product_images','product_variants','production_batches','products',
    'site_settings','testimonials','trademarks',
    'export_leads','newsletter_subscribers','order_items','orders',
    'quote_requests','web_vitals','wholesale_leads'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('REVOKE UPDATE, DELETE, TRUNCATE ON public.%I FROM anon', t);
  END LOOP;
END $$;