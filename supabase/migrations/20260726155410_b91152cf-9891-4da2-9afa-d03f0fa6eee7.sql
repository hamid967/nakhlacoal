
-- Shared updated_at trigger (idempotent)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ─────────── CATEGORIES ───────────
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  hero_image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── PRODUCTS ───────────
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  story_ar TEXT,
  story_en TEXT,
  hero_image TEXT,
  base_price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'SAR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_active_idx ON public.products(is_active) WHERE is_active = true;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "products_admin_all" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── PRODUCT VARIANTS ───────────
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  label_ar TEXT NOT NULL,
  label_en TEXT NOT NULL,
  weight_kg NUMERIC(6,2),
  pack_size INT,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pv_product_idx ON public.product_variants(product_id);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pv_public_read" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "pv_admin_all" ON public.product_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pv_updated BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── PRODUCT IMAGES ───────────
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_ar TEXT,
  alt_en TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pi_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pi_public_read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "pi_admin_all" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ─────────── CARTS ───────────
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  currency TEXT NOT NULL DEFAULT 'SAR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);
CREATE INDEX carts_user_idx ON public.carts(user_id);
CREATE INDEX carts_session_idx ON public.carts(session_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO anon;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carts_owner" ON public.carts FOR ALL
  USING (user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL))
  WITH CHECK (user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL));
CREATE POLICY "carts_admin_read" ON public.carts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_carts_updated BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── CART ITEMS ───────────
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, variant_id)
);
CREATE INDEX ci_cart_idx ON public.cart_items(cart_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated, anon;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_owner" ON public.cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR c.user_id IS NULL)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR c.user_id IS NULL)));

-- ─────────── ORDER ITEMS ───────────
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  variant_label_snapshot TEXT,
  sku_snapshot TEXT,
  qty INT NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX oi_order_idx ON public.order_items(order_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated, anon;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oi_owner_read" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "oi_insert" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id));

-- ─────────── ADDRESSES ───────────
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'SA',
  region TEXT,
  city TEXT NOT NULL,
  district TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX addresses_user_idx ON public.addresses(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_owner" ON public.addresses FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── ARTICLES ───────────
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  body_ar TEXT,
  body_en TEXT,
  hero_image TEXT,
  author TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_minutes INT,
  published_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX articles_published_idx ON public.articles(is_published, published_at DESC);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "articles_admin_all" ON public.articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── TESTIMONIALS ───────────
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  quote_ar TEXT,
  quote_en TEXT,
  avatar_url TEXT,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_test_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── NEWSLETTER ───────────
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar',
  source TEXT,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, UPDATE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_admin_manage" ON public.newsletter_subscribers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── WHOLESALE LEADS ───────────
CREATE TABLE public.wholesale_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  city TEXT,
  monthly_volume_kg NUMERIC(10,2),
  business_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.wholesale_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.wholesale_leads TO authenticated;
GRANT ALL ON public.wholesale_leads TO service_role;
ALTER TABLE public.wholesale_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wholesale_submit" ON public.wholesale_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "wholesale_admin" ON public.wholesale_leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ws_updated BEFORE UPDATE ON public.wholesale_leads FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── EXPORT LEADS ───────────
CREATE TABLE public.export_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  port_of_discharge TEXT,
  container_size TEXT,
  monthly_volume_tons NUMERIC(10,2),
  incoterm TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.export_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.export_leads TO authenticated;
GRANT ALL ON public.export_leads TO service_role;
ALTER TABLE public.export_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "export_submit" ON public.export_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "export_admin" ON public.export_leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_exp_updated BEFORE UPDATE ON public.export_leads FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── CERTIFICATIONS ───────────
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  issuer TEXT,
  cert_number TEXT,
  valid_until DATE,
  document_url TEXT,
  logo_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon, authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert_public_read" ON public.certifications FOR SELECT USING (is_public = true);
CREATE POLICY "cert_admin_all" ON public.certifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cert_updated BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── PRODUCTION BATCHES ───────────
CREATE TABLE public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  produced_at DATE NOT NULL,
  moisture_pct NUMERIC(5,2),
  ash_pct NUMERIC(5,2),
  calorific_kcal_kg INT,
  burn_time_min INT,
  lab_report_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pb_product_idx ON public.production_batches(product_id);
GRANT SELECT ON public.production_batches TO anon, authenticated;
GRANT ALL ON public.production_batches TO service_role;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_public_read" ON public.production_batches FOR SELECT USING (is_public = true);
CREATE POLICY "pb_admin_all" ON public.production_batches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pb_updated BEFORE UPDATE ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─────────── SITE SETTINGS ───────────
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
