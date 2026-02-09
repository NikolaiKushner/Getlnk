-- Subscription & Monetization Schema
-- Run this in your Supabase SQL Editor AFTER USER_AUTH_SETUP.sql and LINKINBIO_SETUP.sql

-- ============================================
-- 1. Subscription Plan Enum
-- ============================================
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'business');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

-- ============================================
-- 2. Subscription Plans Table (reference data)
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'business'
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER NOT NULL DEFAULT 0,  -- in cents
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, features) VALUES
  ('free', 'Free', 0, 0, '{
    "max_links": 5,
    "max_social_links": 3,
    "max_bio_length": 160,
    "themes": ["default", "dark", "minimal"],
    "analytics_retention_days": 7,
    "analytics_referrers": false,
    "analytics_countries": false,
    "analytics_export": false,
    "seo_controls": false,
    "link_thumbnails": false,
    "link_scheduling": false,
    "custom_domain": false,
    "email_capture": false,
    "remove_branding": false,
    "priority_support": false
  }'::jsonb),
  ('pro', 'Pro', 300, 2400, '{
    "max_links": -1,
    "max_social_links": -1,
    "max_bio_length": 500,
    "themes": ["default", "dark", "gradient", "minimal", "ocean"],
    "analytics_retention_days": 90,
    "analytics_referrers": true,
    "analytics_countries": true,
    "analytics_export": false,
    "seo_controls": true,
    "link_thumbnails": true,
    "link_scheduling": false,
    "custom_domain": false,
    "email_capture": false,
    "remove_branding": true,
    "priority_support": true
  }'::jsonb),
  ('business', 'Business', 900, 7200, '{
    "max_links": -1,
    "max_social_links": -1,
    "max_bio_length": 500,
    "themes": ["default", "dark", "gradient", "minimal", "ocean"],
    "analytics_retention_days": -1,
    "analytics_referrers": true,
    "analytics_countries": true,
    "analytics_export": true,
    "seo_controls": true,
    "link_thumbnails": true,
    "link_scheduling": true,
    "custom_domain": true,
    "email_capture": true,
    "remove_branding": true,
    "priority_support": true
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. Add subscription columns to user_profiles
-- ============================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS plan subscription_plan DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status subscription_status,
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS user_profiles_stripe_customer_id_idx
  ON user_profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_profiles_stripe_subscription_id_idx
  ON user_profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_profiles_plan_idx
  ON user_profiles(plan);

-- ============================================
-- 4. Subscription Events Table (audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'upgraded', 'downgraded', 'canceled', 'renewed', 'payment_failed', 'trial_started', 'trial_ended'
  from_plan subscription_plan,
  to_plan subscription_plan,
  stripe_event_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscription events
CREATE INDEX IF NOT EXISTS subscription_events_user_id_idx ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS subscription_events_created_at_idx ON subscription_events(created_at);
CREATE INDEX IF NOT EXISTS subscription_events_stripe_event_id_idx
  ON subscription_events(stripe_event_id) WHERE stripe_event_id IS NOT NULL;

-- ============================================
-- 5. RLS Policies
-- ============================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Everyone can read subscription plans (they're public reference data)
CREATE POLICY "Subscription plans are viewable by everyone"
  ON subscription_plans FOR SELECT
  USING (true);

-- Only superadmins can modify plans
CREATE POLICY "Superadmins can manage subscription plans"
  ON subscription_plans FOR ALL
  USING (is_superadmin());

-- Users can view their own subscription events
CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert subscription events
-- The service role bypasses RLS, so no INSERT policy needed for it
-- But we add one for superadmins to view all
CREATE POLICY "Superadmins can view all subscription events"
  ON subscription_events FOR SELECT
  USING (is_superadmin());

-- ============================================
-- 6. Updated At Trigger for subscription_plans
-- ============================================
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Helper function to get user plan limits
-- ============================================
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS subscription_plan AS $$
DECLARE
  user_plan subscription_plan;
BEGIN
  SELECT plan INTO user_plan
  FROM user_profiles
  WHERE id = p_user_id;

  RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_plan(UUID) TO authenticated;

-- ============================================
-- 8. Update handle_new_user to set default plan
-- ============================================
-- The existing trigger already inserts with defaults,
-- and the plan column has DEFAULT 'free', so new users
-- automatically get the free plan. No changes needed.
