import { supabase } from '../config/supabase';
import { SubscriptionPlan, Transaction } from '../types';

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTransaction(
    planId: string,
    amount: number,
    paymentMethod: string,
    paymentProvider: string
  ): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount,
        currency: 'USD',
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeTransaction(
    transactionId: string,
    transactionReference: string
  ): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        transaction_reference: transactionReference,
      })
      .eq('id', transactionId);

    if (error) throw error;

    const { data: transaction } = await supabase
      .from('transactions')
      .select('plan_id')
      .eq('id', transactionId)
      .single();

    if (transaction) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('tier, duration_days')
        .eq('id', transaction.plan_id)
        .single();

      if (plan) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

          await supabase
            .from('profiles')
            .update({
              is_subscribed: true,
              subscription_tier: plan.tier,
              subscription_expires_at: expiresAt.toISOString(),
            })
            .eq('id', user.id);
        }
      }
    }
  },

  async getTransactionHistory(): Promise<Transaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async checkSubscriptionStatus(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_subscribed, subscription_expires_at')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !profile.is_subscribed) return false;

    if (profile.subscription_expires_at) {
      const expiresAt = new Date(profile.subscription_expires_at);
      return expiresAt > new Date();
    }

    return false;
  },
};
