import { supabase } from './supabase';
import { getAuthRedirectUrl } from './linking';
import type { User } from '../types/database';

export async function signInWithPassword(email: string, password: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return {};
}

export async function sendMagicLink(email: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) return { error: error.message };
  return {};
}

export async function createUserProfile(
  userId: string,
  data: { email: string; name?: string }
): Promise<{ error?: string }> {
  const { error } = await supabase.from('users').insert({
    id: userId,
    email: data.email,
    name: data.name || '',
    default_visibility: 'public',
    subscription_status: 'none',
    invites_remaining: 0,
    onboarded: false,
  });
  if (error) return { error: error.message };
  return {};
}

export async function getUserProfile(userId: string): Promise<{ user?: User; error?: string }> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return { error: error.message };
  return { user: data as User };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'username' | 'bio' | 'avatar_url' | 'website' | 'default_visibility' | 'onboarded'>>
): Promise<{ error?: string }> {
  const updateData: Record<string, unknown> = { ...updates };
  if (updates.username) {
    updateData.username_changed_at = new Date().toISOString();
  }
  const { error } = await supabase.from('users').update(updateData).eq('id', userId);
  if (error) return { error: error.message };
  return {};
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return !data;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function deleteAccount(userId: string): Promise<{ error?: string }> {
  // Delete user profile (cascades to all related data)
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) return { error: error.message };
  await supabase.auth.signOut();
  return {};
}
