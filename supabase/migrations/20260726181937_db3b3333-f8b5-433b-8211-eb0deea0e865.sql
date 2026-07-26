
-- Phase 7 — Marketplace Sync & Growth Engine

-- =========================================================================
-- 1) ANALYTICS EVENTS
-- =========================================================================
CREATE TABLE public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);

GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO authenticated, anon;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_insert_all" ON public.analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "analytics_admin_read" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

-- =========================================================================
-- 2) PRODUCT REVIEWS
-- =========================================================================
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id, approved);
CREATE UNIQUE INDEX uq_product_reviews_user_product ON public.product_reviews(user_id, product_id);

GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read_approved" ON public.product_reviews
  FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "reviews_owner_read" ON public.product_reviews
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "reviews_admin_read" ON public.product_reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "reviews_insert_verified_buyer" ON public.product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      JOIN public.product_variants pv ON pv.id = oi.variant_id
      WHERE o.user_id = auth.uid()
        AND o.status IN ('delivered','completed')
        AND pv.product_id = product_reviews.product_id
    )
  );
CREATE POLICY "reviews_owner_update" ON public.product_reviews
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND approved = false);
CREATE POLICY "reviews_admin_update" ON public.product_reviews
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================================
-- 3) LOYALTY
-- =========================================================================
CREATE TABLE public.loyalty_accounts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  lifetime_spend_sar NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.loyalty_accounts TO authenticated;
GRANT ALL ON public.loyalty_accounts TO service_role;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_owner_read" ON public.loyalty_accounts
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem','expire','adjust')),
  points INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_tx_user ON public.loyalty_transactions(user_id, created_at DESC);
GRANT SELECT ON public.loyalty_transactions TO authenticated;
GRANT ALL ON public.loyalty_transactions TO service_role;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_tx_owner_read" ON public.loyalty_transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- Award loyalty on order delivered
CREATE OR REPLACE FUNCTION public.trg_award_loyalty()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _pts INTEGER;
  _tier TEXT;
  _lifetime NUMERIC(14,2);
BEGIN
  IF NEW.status = 'delivered'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.user_id IS NOT NULL
     AND COALESCE(NEW.grand_total_sar,0) > 0
  THEN
    IF EXISTS (SELECT 1 FROM public.loyalty_transactions WHERE order_id = NEW.id AND type = 'earn') THEN
      RETURN NEW;
    END IF;
    _pts := FLOOR(COALESCE(NEW.grand_total_sar,0) / 10.0)::INT;
    IF _pts <= 0 THEN RETURN NEW; END IF;

    INSERT INTO public.loyalty_accounts (user_id, points_balance, lifetime_spend_sar)
    VALUES (NEW.user_id, _pts, COALESCE(NEW.grand_total_sar,0))
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = public.loyalty_accounts.points_balance + EXCLUDED.points_balance,
          lifetime_spend_sar = public.loyalty_accounts.lifetime_spend_sar + EXCLUDED.lifetime_spend_sar,
          updated_at = now()
    RETURNING lifetime_spend_sar INTO _lifetime;

    _tier := CASE
      WHEN _lifetime >= 50000 THEN 'platinum'
      WHEN _lifetime >= 15000 THEN 'gold'
      WHEN _lifetime >= 5000  THEN 'silver'
      ELSE 'bronze'
    END;
    UPDATE public.loyalty_accounts SET tier = _tier WHERE user_id = NEW.user_id;

    INSERT INTO public.loyalty_transactions (user_id, order_id, type, points, reason)
    VALUES (NEW.user_id, NEW.id, 'earn', _pts, 'order_delivered');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_award_loyalty ON public.orders;
CREATE TRIGGER trg_award_loyalty
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_loyalty();

-- =========================================================================
-- 4) REFERRALS
-- =========================================================================
CREATE TABLE public.referral_codes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses INTEGER NOT NULL DEFAULT 0,
  total_reward_sar NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT SELECT ON public.referral_codes TO anon;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_owner_read" ON public.referral_codes
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
-- Public read (by code) is intentionally restricted; validation happens via SECURITY DEFINER RPC.

CREATE TABLE public.referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_sar NUMERIC(12,2) NOT NULL DEFAULT 0,
  reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_referral_redemptions_referrer ON public.referral_redemptions(referrer_user_id);
GRANT SELECT ON public.referral_redemptions TO authenticated;
GRANT ALL ON public.referral_redemptions TO service_role;
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_redemptions_read" ON public.referral_redemptions
  FOR SELECT TO authenticated USING (referrer_user_id = auth.uid() OR referred_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Auto-issue referral code on profile creation
CREATE OR REPLACE FUNCTION public.tg_issue_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _code TEXT;
BEGIN
  _code := upper(substr(replace(NEW.id::text,'-',''), 1, 8));
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, _code)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_issue_referral_code ON public.profiles;
CREATE TRIGGER trg_issue_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_issue_referral_code();

-- Public validation RPC (no direct table exposure)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code TEXT)
RETURNS TABLE(valid BOOLEAN, referrer UUID)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = upper(_code))::boolean,
         (SELECT user_id FROM public.referral_codes WHERE code = upper(_code) LIMIT 1)
$$;

-- =========================================================================
-- 5) EMAIL CAMPAIGNS
-- =========================================================================
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  segment JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','completed','paused')),
  sent_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_admin_all" ON public.email_campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================================
-- 6) MARKETPLACE
-- =========================================================================
CREATE TABLE public.marketplace_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('amazon','noon','other')),
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  credentials_ref TEXT,
  last_sync_at TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_channels TO authenticated;
GRANT ALL ON public.marketplace_channels TO service_role;
ALTER TABLE public.marketplace_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mkt_channels_admin" ON public.marketplace_channels
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_mkt_channels_updated_at
  BEFORE UPDATE ON public.marketplace_channels
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.marketplace_channels(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  external_sku TEXT,
  external_id TEXT,
  price_sar NUMERIC(12,2),
  stock_qty INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','error','paused')),
  last_pushed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel_id, variant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mkt_listings_admin" ON public.marketplace_listings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

CREATE TRIGGER trg_mkt_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.marketplace_channels(id) ON DELETE CASCADE,
  external_order_id TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'imported',
  UNIQUE (channel_id, external_order_id)
);
GRANT SELECT, INSERT, UPDATE ON public.marketplace_orders TO authenticated;
GRANT ALL ON public.marketplace_orders TO service_role;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mkt_orders_admin" ON public.marketplace_orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

-- Backfill referral codes for existing profiles
INSERT INTO public.referral_codes (user_id, code)
SELECT id, upper(substr(replace(id::text,'-',''), 1, 8))
FROM public.profiles
ON CONFLICT DO NOTHING;
