import { supabase } from './supabase';

interface GoalStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}

interface ActiveGoalProgress {
  id: string;
  title: string;
  goal_type: string;
  current_value: number;
  target_value: number | null;
  progress: number;
}

export async function getGoalStats(userId: string): Promise<GoalStats> {
  const [{ count: total }, { count: completed }] = await Promise.all([
    supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
  ]);

  const t = total ?? 0;
  const c = completed ?? 0;
  return {
    total: t,
    active: t - c,
    completed: c,
    completionRate: t > 0 ? Math.round((c / t) * 100) : 0,
  };
}

export async function getActiveGoalProgress(userId: string): Promise<ActiveGoalProgress[]> {
  const { data } = await supabase
    .from('goals')
    .select('id, title, goal_type, current_value, target_value')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (data || []).map((g) => ({
    ...g,
    progress: g.target_value ? Math.min(Math.round((g.current_value / g.target_value) * 100), 100) : 0,
  }));
}

export async function getFollowerGrowth(userId: string): Promise<{ count: number }> {
  const { count } = await supabase
    .from('follows')
    .select('follower_id', { count: 'exact', head: true })
    .eq('following_id', userId);
  return { count: count ?? 0 };
}

export async function getMostKudozdPosts(userId: string, limit = 5): Promise<Array<{ id: string; content: string; kudoz_count: number }>> {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!posts || posts.length === 0) return [];

  const results = await Promise.all(
    posts.map(async (p) => {
      const { count } = await supabase
        .from('reactions')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', p.id);
      return { ...p, kudoz_count: count ?? 0 };
    })
  );

  return results.sort((a, b) => b.kudoz_count - a.kudoz_count).slice(0, limit);
}
