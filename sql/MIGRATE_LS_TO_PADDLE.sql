-- Migration: Lemon Squeezy → Paddle
-- Run this in Supabase SQL Editor
-- If you already ran MIGRATE_STRIPE_TO_LS.sql, run this next.
-- If starting fresh (columns are still stripe_*), run MIGRATE_STRIPE_TO_PADDLE.sql instead.

-- 1. Rename columns in user_profiles
ALTER TABLE user_profiles RENAME COLUMN ls_customer_id TO paddle_customer_id;
ALTER TABLE user_profiles RENAME COLUMN ls_subscription_id TO paddle_subscription_id;

-- 2. Rename portal URL columns (Paddle portal works differently but we keep the column)
ALTER TABLE user_profiles RENAME COLUMN ls_portal_url TO paddle_portal_url;
ALTER TABLE user_profiles RENAME COLUMN ls_update_payment_url TO paddle_update_payment_url;

-- 3. Rename columns in subscription_plans
ALTER TABLE subscription_plans RENAME COLUMN ls_variant_id_monthly TO paddle_price_id_monthly;
ALTER TABLE subscription_plans RENAME COLUMN ls_variant_id_yearly TO paddle_price_id_yearly;

-- 4. Rename in subscription_events
ALTER TABLE subscription_events RENAME COLUMN ls_event_id TO paddle_event_id;

-- 5. Recreate indexes with new names
DROP INDEX IF EXISTS idx_user_profiles_ls_customer_id;
DROP INDEX IF EXISTS idx_user_profiles_ls_subscription_id;
DROP INDEX IF EXISTS idx_subscription_events_ls_event_id;

CREATE INDEX IF NOT EXISTS idx_user_profiles_paddle_customer_id
  ON user_profiles(paddle_customer_id) WHERE paddle_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_paddle_subscription_id
  ON user_profiles(paddle_subscription_id) WHERE paddle_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_events_paddle_event_id
  ON subscription_events(paddle_event_id) WHERE paddle_event_id IS NOT NULL;
