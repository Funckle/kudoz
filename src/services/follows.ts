import { supabase } from './supabase';
import type { User } from '../types/database';

export async function followUser(followerId: string, followingId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (error) return { error: error.message };
  return {};
}

export async function unfollowUser(followerId: string, followingId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: followerId, following_id: followingId });
  if (error) return { error: error.message };
  return {};
}

export async function getFollowers(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ users: User[]; error?: string }> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower:users!follows_follower_id_fkey(*)')
    .eq('following_id', userId)
    .range(offset, offset + limit - 1);

  if (error) return { users: [], error: error.message };
  return { users: (data || []).map((d: any) => d.follower) as User[] };
}

export async function getFollowing(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ users: User[]; error?: string }> {
  const { data, error } = await supabase
    .from('follows')
    .select('following:users!follows_following_id_fkey(*)')
    .eq('follower_id', userId)
    .range(offset, offset + limit - 1);

  if (error) return { users: [], error: error.message };
  return { users: (data || []).map((d: any) => d.following) as User[] };
}

export async function checkFollowStatus(
  followerId: string,
  followingId: string
): Promise<{ isFollowing: boolean; isMutual: boolean }> {
  const [{ data: forward }, { data: reverse }] = await Promise.all([
    supabase.from('follows').select('follower_id').match({ follower_id: followerId, following_id: followingId }).maybeSingle(),
    supabase.from('follows').select('follower_id').match({ follower_id: followingId, following_id: followerId }).maybeSingle(),
  ]);
  return { isFollowing: !!forward, isMutual: !!forward && !!reverse };
}

export async function getFollowerCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('follows')
    .select('follower_id', { count: 'exact', head: true })
    .eq('following_id', userId);
  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('follows')
    .select('following_id', { count: 'exact', head: true })
    .eq('follower_id', userId);
  return count ?? 0;
}
