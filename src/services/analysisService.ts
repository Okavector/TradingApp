import { supabase } from '../config/supabase';
import { DailyAnalysis } from '../types';

export const analysisService = {
  async getPublishedAnalysis(): Promise<DailyAnalysis[]> {
    const { data, error } = await supabase
      .from('daily_analysis')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data || [];
  },

  async getAnalysisById(id: string): Promise<DailyAnalysis | null> {
    const { data, error } = await supabase
      .from('daily_analysis')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createAnalysis(
    analysis: Omit<DailyAnalysis, 'id' | 'created_at' | 'created_by' | 'published_at'>
  ): Promise<DailyAnalysis> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('daily_analysis')
      .insert({ ...analysis, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAnalysis(id: string, updates: Partial<DailyAnalysis>): Promise<DailyAnalysis> {
    const { data, error } = await supabase
      .from('daily_analysis')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publishAnalysis(id: string): Promise<DailyAnalysis> {
    return this.updateAnalysis(id, {
      published: true,
      published_at: new Date().toISOString(),
    });
  },

  async unpublishAnalysis(id: string): Promise<DailyAnalysis> {
    return this.updateAnalysis(id, {
      published: false,
      published_at: null,
    });
  },

  async getAllAnalysis(): Promise<DailyAnalysis[]> {
    const { data, error } = await supabase
      .from('daily_analysis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
