import { supabase } from './supabase';

export async function giveKudoz(userId: string, postId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('reactions').insert({ user_id: userId, post_id: postId });
  if (error) return { error: error.message };
  return {};
}

export async function removeKudoz(userId: string, postId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .match({ user_id: userId, post_id: postId });
  if (error) return { error: error.message };
  return {};
}

export async function getKudozCount(postId: string): Promise<number> {
  const { count } = await supabase
    .from('reactions')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count ?? 0;
}

export async function hasGivenKudoz(userId: string, postId: string): Promise<boolean> {
  const { data } = await supabase
    .from('reactions')
    .select('id')
    .match({ user_id: userId, post_id: postId })
    .maybeSingle();
  return !!data;
}
