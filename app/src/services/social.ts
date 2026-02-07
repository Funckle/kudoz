import { supabase } from './supabase';
import type { User } from '../types/database';

export async function blockUser(blockerId: string, blockedId: string): Promise<{ error?: string }> {
  // Block + unfollow in both directions
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) return { error: error.message };
  await supabase.from('follows').delete().match({ follower_id: blockerId, following_id: blockedId });
  await supabase.from('follows').delete().match({ follower_id: blockedId, following_id: blockerId });
  return {};
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('blocks').delete().match({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) return { error: error.message };
  return {};
}

export async function muteUser(muterId: string, mutedId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('mutes').insert({ muter_id: muterId, muted_id: mutedId });
  if (error) return { error: error.message };
  return {};
}

export async function unmuteUser(muterId: string, mutedId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('mutes').delete().match({ muter_id: muterId, muted_id: mutedId });
  if (error) return { error: error.message };
  return {};
}

export async function getBlockedUsers(userId: string): Promise<{ users: User[]; error?: string }> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked:users!blocks_blocked_id_fkey(*)')
    .eq('blocker_id', userId);
  if (error) return { users: [], error: error.message };
  return { users: (data || []).map((d: any) => d.blocked) as User[] };
}

export async function getMutedUsers(userId: string): Promise<{ users: User[]; error?: string }> {
  const { data, error } = await supabase
    .from('mutes')
    .select('muted:users!mutes_muted_id_fkey(*)')
    .eq('muter_id', userId);
  if (error) return { users: [], error: error.message };
  return { users: (data || []).map((d: any) => d.muted) as User[] };
}

export async function isBlocked(userId: string, targetId: string): Promise<boolean> {
  const { data } = await supabase
    .from('blocks')
    .select('blocker_id')
    .or(`and(blocker_id.eq.${userId},blocked_id.eq.${targetId}),and(blocker_id.eq.${targetId},blocked_id.eq.${userId})`)
    .maybeSingle();
  return !!data;
}
