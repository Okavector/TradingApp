import { supabase } from '../config/supabase';
import { Signal } from '../types';

export const signalsService = {
  async getActiveSignals(): Promise<Signal[]> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSignalById(id: string): Promise<Signal | null> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getSignalHistory(): Promise<Signal[]> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .in('status', ['closed', 'expired'])
      .order('closed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async createSignal(signal: Omit<Signal, 'id' | 'created_at' | 'created_by'>): Promise<Signal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('signals')
      .insert({ ...signal, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSignal(id: string, updates: Partial<Signal>): Promise<Signal> {
    const { data, error } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async closeSignal(
    id: string,
    result: 'profit' | 'loss' | 'breakeven',
    profitPercentage?: number
  ): Promise<Signal> {
    const updates: Partial<Signal> = {
      status: 'closed',
      result,
      profit_percentage: profitPercentage,
      closed_at: new Date().toISOString(),
    };

    return this.updateSignal(id, updates);
  },
};
