import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import type { Invite } from '../types/database';

export async function generateInviteCode(inviterId: string): Promise<{ invite?: Invite; error?: string }> {
  // Check remaining invites
  const { data: user } = await supabase
    .from('users')
    .select('invites_remaining')
    .eq('id', inviterId)
    .single();

  if (!user || user.invites_remaining <= 0) {
    return { error: 'No invites remaining' };
  }

  const code = Crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({ inviter_id: inviterId, invite_code: code })
    .select()
    .single();

  if (error) return { error: error.message };

  // Decrement remaining
  await supabase
    .from('users')
    .update({ invites_remaining: user.invites_remaining - 1 })
    .eq('id', inviterId);

  return { invite: invite as Invite };
}

export async function getMyInvites(inviterId: string): Promise<{ invites: Invite[]; error?: string }> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('inviter_id', inviterId)
    .order('created_at', { ascending: false });

  if (error) return { invites: [], error: error.message };
  return { invites: (data || []) as Invite[] };
}

export async function redeemInvite(code: string, userId: string): Promise<{ error?: string }> {
  const { data: invite } = await supabase
    .from('invites')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .is('used_by', null)
    .single();

  if (!invite) return { error: 'Invalid or already used invite code' };

  const { error } = await supabase
    .from('invites')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('id', invite.id);

  if (error) return { error: error.message };

  // Set invited_by
  await supabase.from('users').update({ invited_by: invite.inviter_id }).eq('id', userId);
  return {};
}

export async function getRemainingInvites(userId: string): Promise<number> {
  const { data } = await supabase
    .from('users')
    .select('invites_remaining')
    .eq('id', userId)
    .single();
  return data?.invites_remaining ?? 0;
}
