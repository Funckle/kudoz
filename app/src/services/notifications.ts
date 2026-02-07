import { supabase } from './supabase';
import type { NotificationWithData } from '../types/database';

export async function getNotifications(
  userId: string,
  limit = 30,
  offset = 0
): Promise<{ notifications: NotificationWithData[]; error?: string }> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { notifications: [], error: error.message };

  // Enrich with actor info
  const notifications = data as NotificationWithData[];
  const actorIds = [...new Set(notifications.map((n) => (n.data as Record<string, string>).actor_id).filter(Boolean))];
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('users')
      .select('id, name, username, avatar_url')
      .in('id', actorIds);
    const actorMap = new Map((actors || []).map((a) => [a.id, a]));
    for (const n of notifications) {
      const actorId = (n.data as Record<string, string>).actor_id;
      if (actorId) n.actor = actorMap.get(actorId);
    }
  }

  return { notifications };
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);
}

export async function markAllRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  return count ?? 0;
}
