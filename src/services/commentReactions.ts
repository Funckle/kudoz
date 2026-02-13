import { supabase } from './supabase';

export async function giveCommentKudos(userId: string, commentId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('comment_reactions').insert({ user_id: userId, comment_id: commentId });
  if (error) return { error: error.message };
  return {};
}

export async function removeCommentKudos(userId: string, commentId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('comment_reactions')
    .delete()
    .match({ user_id: userId, comment_id: commentId });
  if (error) return { error: error.message };
  return {};
}
