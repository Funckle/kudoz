import { supabase } from './supabase';
import type { PostWithAuthor } from '../types/database';

interface SearchResult {
  result_type: 'user' | 'goal' | 'post';
  result_id: string;
  title: string;
  subtitle: string | null;
  avatar_url: string | null;
  rank: number;
}

export async function searchAll(
  query: string,
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ results: SearchResult[]; error?: string }> {
  if (!query.trim()) return { results: [] };

  const { data, error } = await supabase.rpc('search_content', {
    p_query: query,
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) return { results: [], error: error.message };
  return { results: (data || []) as SearchResult[] };
}

export async function getPostsByCategory(
  categoryId: string,
  limit = 20,
  offset = 0
): Promise<{ posts: PostWithAuthor[]; error?: string }> {
  // First get goal IDs in this category
  const { data: goalCats } = await supabase
    .from('goal_categories')
    .select('goal_id')
    .eq('category_id', categoryId);

  const goalIds = (goalCats || []).map((gc: { goal_id: string }) => gc.goal_id);
  if (goalIds.length === 0) return { posts: [] };

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!posts_user_id_fkey(id, name, username, avatar_url),
      goal:goals!posts_goal_id_fkey(id, title, goal_type, target_value, current_value, status)
    `)
    .in('goal_id', goalIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { posts: [], error: error.message };

  const posts: PostWithAuthor[] = (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    kudos_count: 0,
    comment_count: 0,
    has_given_kudos: false,
  })) as PostWithAuthor[];

  return { posts };
}
