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

export async function getGoalsByCategory(userId: string): Promise<Array<{ name: string; count: number; color: string }>> {
  const { data: goals } = await supabase
    .from('goals')
    .select('id, goal_categories(category_id, categories(name, color))')
    .eq('user_id', userId);

  if (!goals || goals.length === 0) return [];

  const categoryMap = new Map<string, { name: string; count: number; color: string }>();

  for (const goal of goals) {
    const categories = (goal.goal_categories as Array<{ categories: { name: string; color: string } }>) || [];
    for (const gc of categories) {
      const cat = gc.categories;
      if (!cat) continue;
      const existing = categoryMap.get(cat.name) || { name: cat.name, count: 0, color: cat.color };
      existing.count++;
      categoryMap.set(cat.name, existing);
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
}

export async function getCompletionRateOverTime(userId: string): Promise<Array<{ month: string; rate: number }>> {
  const { data: goals } = await supabase
    .from('goals')
    .select('status, created_at, completed_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (!goals || goals.length === 0) return [];

  // Group by month
  const monthMap = new Map<string, { total: number; completed: number }>();

  for (const goal of goals) {
    const month = goal.created_at.substring(0, 7); // YYYY-MM
    const existing = monthMap.get(month) || { total: 0, completed: 0 };
    existing.total++;
    if (goal.status === 'completed') existing.completed++;
    monthMap.set(month, existing);
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }))
    .slice(-6); // Last 6 months
}

export async function getMostKudozdGoals(userId: string, limit = 5): Promise<Array<{ id: string; title: string; kudoz_count: number }>> {
  const { data: goals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', userId);

  if (!goals || goals.length === 0) return [];

  // Count kudoz per goal in parallel
  const results = await Promise.all(
    goals.map(async (g) => {
      const { data: postIds } = await supabase.from('posts').select('id').eq('goal_id', g.id);
      if (!postIds || postIds.length === 0) return { ...g, kudoz_count: 0 };

      const { count } = await supabase
        .from('reactions')
        .select('id', { count: 'exact', head: true })
        .in('post_id', postIds.map((p) => p.id));

      return { id: g.id, title: g.title, kudoz_count: count ?? 0 };
    })
  );

  return results.filter((g) => g.kudoz_count > 0).sort((a, b) => b.kudoz_count - a.kudoz_count).slice(0, limit);
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
