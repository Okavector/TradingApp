export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_subscribed: boolean;
  subscription_tier: 'basic' | 'premium' | 'vip' | null;
  subscription_expires_at: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'vip';
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_provider: string;
  transaction_reference: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Signal {
  id: string;
  title: string;
  crypto_symbol: string;
  signal_type: 'buy' | 'sell' | 'hold';
  entry_price: number;
  target_price: number | null;
  stop_loss: number | null;
  leverage: string | null;
  confidence_level: 'low' | 'medium' | 'high';
  description: string;
  tier_access: string[];
  status: 'active' | 'closed' | 'expired';
  result: 'profit' | 'loss' | 'breakeven' | null;
  profit_percentage: number | null;
  created_by: string;
  created_at: string;
  expires_at: string | null;
  closed_at: string | null;
}

export interface DailyAnalysis {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  market_sentiment: 'bullish' | 'bearish' | 'neutral' | null;
  tier_access: string[];
  featured_cryptos: string[];
  image_url: string | null;
  published: boolean;
  created_by: string;
  created_at: string;
  published_at: string | null;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  subject: string;
  content: string;
  tier_access: string[];
  is_broadcast: boolean;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  notification_type: 'signal' | 'analysis' | 'message' | 'subscription' | 'general';
  reference_id: string | null;
  is_read: boolean;
  sent_at: string;
  read_at: string | null;
}
