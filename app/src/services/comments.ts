import { supabase } from './supabase';
import type { Comment, CommentWithAuthor } from '../types/database';
import { checkContent } from '../utils/moderation';

export async function createComment(data: {
  user_id: string;
  post_id: string;
  content: string;
  parent_comment_id?: string;
}): Promise<{ comment?: Comment; error?: string }> {
  // Check bad words
  const modResult = checkContent(data.content);
  if (!modResult.clean) {
    return { error: 'Please keep your comment friendly' };
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert(data)
    .select()
    .single();

  if (error) {
    if (error.message.includes('subscription_status')) {
      return { error: 'Commenting is a paid feature. Upgrade to join the conversation!' };
    }
    return { error: error.message };
  }
  return { comment: comment as Comment };
}

export async function updateComment(
  commentId: string,
  content: string,
  userId: string
): Promise<{ error?: string }> {
  // Check edit window (5 minutes)
  const { data: comment } = await supabase
    .from('comments')
    .select('created_at, user_id')
    .eq('id', commentId)
    .single();

  if (!comment || comment.user_id !== userId) {
    return { error: 'Not authorized' };
  }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  if (comment.created_at < fiveMinAgo) {
    return { error: 'Comments can only be edited within 5 minutes' };
  }

  // Check if has replies
  const { count } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('parent_comment_id', commentId);

  if (count && count > 0) {
    return { error: 'Cannot edit a comment with replies' };
  }

  const modResult = checkContent(content);
  if (!modResult.clean) {
    return { error: 'Please keep your comment friendly' };
  }

  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) return { error: error.message };
  return {};
}

export async function deleteComment(commentId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) return { error: error.message };
  return {};
}

export async function getCommentsForPost(postId: string): Promise<{ comments: CommentWithAuthor[]; error?: string }> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:users!comments_user_id_fkey(id, name, username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return { comments: [], error: error.message };

  // Organize into tree
  const flat = (data || []) as CommentWithAuthor[];
  const rootComments: CommentWithAuthor[] = [];
  const childMap = new Map<string, CommentWithAuthor[]>();

  for (const comment of flat) {
    if (comment.parent_comment_id) {
      const existing = childMap.get(comment.parent_comment_id) || [];
      existing.push(comment);
      childMap.set(comment.parent_comment_id, existing);
    } else {
      rootComments.push(comment);
    }
  }

  // Attach replies recursively
  function attachReplies(comments: CommentWithAuthor[]): CommentWithAuthor[] {
    return comments.map((c) => ({
      ...c,
      replies: attachReplies(childMap.get(c.id) || []),
    }));
  }

  return { comments: attachReplies(rootComments) };
}
