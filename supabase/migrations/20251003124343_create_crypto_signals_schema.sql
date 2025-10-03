/*
  # Crypto Signals App Database Schema

  ## Overview
  Complete database schema for a crypto signals and analysis application with subscription management, 
  user authentication, signals delivery, in-app messaging, and transaction tracking.

  ## New Tables
  
  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text, nullable)
  - `role` (text, default 'user') - 'user' or 'admin'
  - `is_subscribed` (boolean, default false)
  - `subscription_tier` (text, nullable) - 'basic', 'premium', 'vip'
  - `subscription_expires_at` (timestamptz, nullable)
  - `push_token` (text, nullable) - for push notifications
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `subscription_plans`
  Available subscription tiers and pricing
  - `id` (uuid, PK)
  - `name` (text) - 'Basic', 'Premium', 'VIP'
  - `tier` (text, unique) - 'basic', 'premium', 'vip'
  - `description` (text)
  - `price` (decimal)
  - `currency` (text, default 'USD')
  - `duration_days` (integer) - subscription duration
  - `features` (jsonb) - list of features
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)

  ### 3. `transactions`
  Payment transaction history
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `plan_id` (uuid, FK to subscription_plans)
  - `amount` (decimal)
  - `currency` (text)
  - `status` (text) - 'pending', 'completed', 'failed', 'refunded'
  - `payment_method` (text)
  - `payment_provider` (text) - 'stripe', 'paypal', etc.
  - `transaction_reference` (text, nullable)
  - `metadata` (jsonb, nullable)
  - `created_at` (timestamptz)

  ### 4. `signals`
  Trading signals sent to subscribers
  - `id` (uuid, PK)
  - `title` (text)
  - `crypto_symbol` (text) - BTC, ETH, etc.
  - `signal_type` (text) - 'buy', 'sell', 'hold'
  - `entry_price` (decimal)
  - `target_price` (decimal, nullable)
  - `stop_loss` (decimal, nullable)
  - `leverage` (text, nullable) - '5x', '10x', etc.
  - `confidence_level` (text) - 'low', 'medium', 'high'
  - `description` (text)
  - `tier_access` (text[]) - ['basic', 'premium', 'vip'] - who can see this
  - `status` (text, default 'active') - 'active', 'closed', 'expired'
  - `result` (text, nullable) - 'profit', 'loss', 'breakeven'
  - `profit_percentage` (decimal, nullable)
  - `created_by` (uuid, FK to profiles)
  - `created_at` (timestamptz)
  - `expires_at` (timestamptz, nullable)
  - `closed_at` (timestamptz, nullable)

  ### 5. `daily_analysis`
  Daily market analysis posts
  - `id` (uuid, PK)
  - `title` (text)
  - `content` (text)
  - `summary` (text, nullable)
  - `market_sentiment` (text, nullable) - 'bullish', 'bearish', 'neutral'
  - `tier_access` (text[]) - who can access this analysis
  - `featured_cryptos` (text[]) - array of crypto symbols
  - `image_url` (text, nullable)
  - `published` (boolean, default false)
  - `created_by` (uuid, FK to profiles)
  - `created_at` (timestamptz)
  - `published_at` (timestamptz, nullable)

  ### 6. `messages`
  In-app messages for subscribers
  - `id` (uuid, PK)
  - `sender_id` (uuid, FK to profiles) - admin sending message
  - `recipient_id` (uuid, FK to profiles, nullable) - specific user or null for broadcast
  - `subject` (text)
  - `content` (text)
  - `tier_access` (text[]) - which subscription tiers can see this
  - `is_broadcast` (boolean, default false)
  - `is_read` (boolean, default false)
  - `created_at` (timestamptz)
  - `read_at` (timestamptz, nullable)

  ### 7. `notifications`
  Push notification tracking
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `title` (text)
  - `body` (text)
  - `notification_type` (text) - 'signal', 'analysis', 'message', 'subscription', 'general'
  - `reference_id` (uuid, nullable) - ID of related signal/analysis/message
  - `is_read` (boolean, default false)
  - `sent_at` (timestamptz)
  - `read_at` (timestamptz, nullable)

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile and update non-critical fields
  - Users can view subscription plans
  - Users can view their own transactions
  - Subscribers can view signals based on their tier
  - Subscribers can view daily analysis based on their tier
  - Subscribers can view messages sent to them
  - Users can view their own notifications
  - Only admins can create/update signals, analysis, and send messages
  - Only admins can manage subscription plans
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_subscribed boolean DEFAULT false,
  subscription_tier text CHECK (subscription_tier IN ('basic', 'premium', 'vip')),
  subscription_expires_at timestamptz,
  push_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text UNIQUE NOT NULL CHECK (tier IN ('basic', 'premium', 'vip')),
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  duration_days integer NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  payment_provider text,
  transaction_reference text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create signals table
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  crypto_symbol text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  entry_price decimal(20,8) NOT NULL,
  target_price decimal(20,8),
  stop_loss decimal(20,8),
  leverage text,
  confidence_level text DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  description text NOT NULL,
  tier_access text[] DEFAULT ARRAY['basic', 'premium', 'vip'],
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  result text CHECK (result IN ('profit', 'loss', 'breakeven')),
  profit_percentage decimal(10,2),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  closed_at timestamptz
);

-- Create daily_analysis table
CREATE TABLE IF NOT EXISTS daily_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  market_sentiment text CHECK (market_sentiment IN ('bullish', 'bearish', 'neutral')),
  tier_access text[] DEFAULT ARRAY['basic', 'premium', 'vip'],
  featured_cryptos text[] DEFAULT ARRAY[]::text[],
  image_url text,
  published boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id),
  recipient_id uuid REFERENCES profiles(id),
  subject text NOT NULL,
  content text NOT NULL,
  tier_access text[] DEFAULT ARRAY['basic', 'premium', 'vip'],
  is_broadcast boolean DEFAULT false,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('signal', 'analysis', 'message', 'subscription', 'general')),
  reference_id uuid,
  is_read boolean DEFAULT false,
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_crypto_symbol ON signals(crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_daily_analysis_published_at ON daily_analysis(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subscription plans policies
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Signals policies
CREATE POLICY "Subscribed users can view signals based on tier"
  ON signals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND is_subscribed = true
        AND subscription_expires_at > now()
        AND subscription_tier = ANY(signals.tier_access)
    )
  );

CREATE POLICY "Admins can manage signals"
  ON signals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Daily analysis policies
CREATE POLICY "Subscribed users can view analysis based on tier"
  ON daily_analysis FOR SELECT
  TO authenticated
  USING (
    published = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND is_subscribed = true
        AND subscription_expires_at > now()
        AND subscription_tier = ANY(daily_analysis.tier_access)
    )
  );

CREATE POLICY "Admins can manage daily analysis"
  ON daily_analysis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages sent to them"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (recipient_id = auth.uid() OR is_broadcast = true) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND is_subscribed = true
        AND subscription_expires_at > now()
        AND subscription_tier = ANY(messages.tier_access)
    )
  );

CREATE POLICY "Users can update read status of their messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Admins can manage messages"
  ON messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, description, price, duration_days, features) VALUES
  ('Basic Plan', 'basic', 'Essential crypto signals and daily analysis', 29.99, 30, 
   '["Daily market analysis", "Basic trading signals", "Community access", "Email support"]'::jsonb),
  ('Premium Plan', 'premium', 'Advanced signals with priority support', 79.99, 30,
   '["All Basic features", "Premium trading signals", "Advanced market analysis", "Priority support", "Exclusive crypto insights"]'::jsonb),
  ('VIP Plan', 'vip', 'Complete access with personal guidance', 149.99, 30,
   '["All Premium features", "VIP trading signals", "Personal trading guidance", "24/7 dedicated support", "Early access to new features", "Private community"]'::jsonb)
ON CONFLICT (tier) DO NOTHING;
