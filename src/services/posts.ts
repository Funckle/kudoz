import { supabase } from './supabase';
import { moderateContent } from './moderation';
import type { Post, PostWithAuthor, Category } from '../types/database';

async function enrichWithCategories(posts: PostWithAuthor[]): Promise<PostWithAuthor[]> {
  if (posts.length === 0) return posts;
  const goalIds = [...new Set(posts.map((p) => p.goal_id))];
  const { data: goalCats } = await supabase
    .from('goal_categories')
    .select('goal_id, categories(*)')
    .in('goal_id', goalIds);

  const catMap = new Map<string, Category[]>();
  for (const gc of (goalCats || []) as Array<{ goal_id: string; categories: Category }>) {
    if (gc.categories) {
      const existing = catMap.get(gc.goal_id) || [];
      existing.push(gc.categories);
      catMap.set(gc.goal_id, existing);
    }
  }

  return posts.map((p) => ({ ...p, categories: catMap.get(p.goal_id) || [] }));
}

export async function createPost(data: {
  user_id: string;
  goal_id: string;
  content?: string;
  post_type: Post['post_type'];
  progress_value?: number;
  media_url?: string;
  media_type?: Post['media_type'];
  media_width?: number;
  media_height?: number;
  media_size_bytes?: number;
}): Promise<{ post?: Post; error?: string }> {
  const moderation = await moderateContent(data.content, data.media_url);
  if (!moderation.allowed) {
    return { error: moderation.reason || 'This content may contain harmful language. Please revise and try again.' };
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert(data)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Update goal progress if progress_value provided
  if (data.progress_value && data.progress_value > 0) {
    const { data: goal } = await supabase
      .from('goals')
      .select('current_value')
      .eq('id', data.goal_id)
      .single();

    if (goal) {
      const currentValue = Number(goal.current_value) || 0;
      const increment = Number(data.progress_value);
      await supabase
        .from('goals')
        .update({ current_value: currentValue + increment })
        .eq('id', data.goal_id);
    }
  }

  return { post: post as Post };
}

export async function updatePost(
  postId: string,
  data: Partial<Pick<Post, 'content' | 'media_url' | 'media_type' | 'media_width' | 'media_height' | 'media_size_bytes'>>
): Promise<{ error?: string }> {
  const moderation = await moderateContent(data.content, data.media_url);
  if (!moderation.allowed) {
    return { error: moderation.reason || 'This content may contain harmful language. Please revise and try again.' };
  }

  const { error } = await supabase
    .from('posts')
    .update({ ...data, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) {
    return { error: error.message };
  }
  return {};
}

export async function deletePost(postId: string): Promise<{ error?: string }> {
  // Get post to reverse progress
  const { data: post } = await supabase
    .from('posts')
    .select('goal_id, progress_value')
    .eq('id', postId)
    .single();

  if (post?.progress_value && post.progress_value > 0) {
    const { data: goal } = await supabase
      .from('goals')
      .select('current_value')
      .eq('id', post.goal_id)
      .single();

    if (goal) {
      await supabase
        .from('goals')
        .update({ current_value: Math.max(0, (goal.current_value || 0) - post.progress_value) })
        .eq('id', post.goal_id);
    }
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) return { error: error.message };
  return {};
}

export async function getFeedPosts(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ posts: PostWithAuthor[]; error?: string }> {
  const { data, error } = await supabase.rpc('get_feed_posts', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) return { posts: [], error: error.message };

  const posts: PostWithAuthor[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    user_id: row.user_id,
    goal_id: row.goal_id,
    content: row.content,
    post_type: row.post_type,
    progress_value: row.progress_value,
    media_url: row.media_url,
    media_type: row.media_type,
    media_width: row.media_width,
    media_height: row.media_height,
    media_size_bytes: row.media_size_bytes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    edited_at: row.edited_at,
    user: {
      id: row.author_id,
      name: row.author_name,
      username: row.author_username,
      avatar_url: row.author_avatar_url,
    },
    goal: {
      id: row.goal_id,
      title: row.goal_title,
      goal_type: row.goal_type,
      target_value: row.goal_target_value,
      current_value: row.goal_current_value,
      status: row.goal_status,
    },
    kudos_count: Number(row.kudos_count) || 0,
    comment_count: Number(row.comment_count) || 0,
    has_given_kudos: Boolean(row.has_given_kudos),
  }));

  return { posts: await enrichWithCategories(posts) };
}

export async function getPostsByGoal(
  goalId: string,
  limit = 20,
  offset = 0
): Promise<{ posts: Post[]; error?: string }> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { posts: [], error: error.message };
  return { posts: (data || []) as Post[] };
}

export async function getPostsByGoalWithAuthors(
  goalId: string,
  limit = 20,
  offset = 0
): Promise<{ posts: PostWithAuthor[]; error?: string }> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!posts_user_id_fkey(id, name, username, avatar_url),
      goal:goals!posts_goal_id_fkey(id, title, goal_type, target_value, current_value, status)
    `)
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { posts: [], error: error.message };

  const posts: PostWithAuthor[] = await Promise.all(
    (data || []).map(async (p: Record<string, unknown>) => {
      const [{ count: kudosCount }, { count: commentCount }] = await Promise.all([
        supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('post_id', p.id as string),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', p.id as string),
      ]);
      return {
        ...p,
        kudos_count: kudosCount ?? 0,
        comment_count: commentCount ?? 0,
        has_given_kudos: false,
      } as PostWithAuthor;
    })
  );

  return { posts: await enrichWithCategories(posts) };
}

export async function getPost(postId: string): Promise<{ post?: PostWithAuthor; error?: string }> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!posts_user_id_fkey(id, name, username, avatar_url),
      goal:goals!posts_goal_id_fkey(id, title, goal_type, target_value, current_value, status)
    `)
    .eq('id', postId)
    .single();

  if (error) return { error: error.message };

  // Get counts
  const [{ count: kudosCount }, { count: commentCount }, { data: givenKudos }] = await Promise.all([
    supabase.from('reactions').select('id', { count: 'exact', head: true }).eq('post_id', postId),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', postId),
    supabase.from('reactions').select('id').eq('post_id', postId).eq('user_id', data.user_id).maybeSingle(),
  ]);

  const post: PostWithAuthor = {
    ...data,
    kudos_count: kudosCount ?? 0,
    comment_count: commentCount ?? 0,
    has_given_kudos: !!givenKudos,
  } as PostWithAuthor;

  const [enriched] = await enrichWithCategories([post]);
  return { post: enriched };
}
