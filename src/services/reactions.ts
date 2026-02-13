import { supabase } from './supabase';

export async function giveKudos(userId: string, postId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('reactions').insert({ user_id: userId, post_id: postId });
  if (error) return { error: error.message };
  return {};
}

export async function removeKudos(userId: string, postId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .match({ user_id: userId, post_id: postId });
  if (error) return { error: error.message };
  return {};
}

export async function getKudosCount(postId: string): Promise<number> {
  const { count } = await supabase
    .from('reactions')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count ?? 0;
}

export async function hasGivenKudos(userId: string, postId: string): Promise<boolean> {
  const { data } = await supabase
    .from('reactions')
    .select('id')
    .match({ user_id: userId, post_id: postId })
    .maybeSingle();
  return !!data;
}
