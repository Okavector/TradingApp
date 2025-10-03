import { supabase } from '../config/supabase';
import { Message } from '../types';

export const messagesService = {
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async sendMessage(
    recipientId: string | null,
    subject: string,
    content: string,
    tierAccess: string[],
    isBroadcast: boolean = false
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject,
        content,
        tier_access: tierAccess,
        is_broadcast: isBroadcast,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sendBroadcastMessage(
    subject: string,
    content: string,
    tierAccess: string[]
  ): Promise<Message> {
    return this.sendMessage(null, subject, content, tierAccess, true);
  },
};
