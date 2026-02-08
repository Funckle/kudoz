import { supabase } from './supabase';
import type { Goal, GoalWithCategories, GoalStatus, Category } from '../types/database';

export async function createGoal(data: {
  user_id: string;
  title: string;
  description: string;
  goal_type: Goal['goal_type'];
  target_value?: number;
  stakes?: string;
  effort_label?: string;
  effort_target?: number;
  visibility: Goal['visibility'];
  category_ids: string[];
}): Promise<{ goal?: Goal; error?: string }> {
  const { category_ids, ...goalData } = data;

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({ ...goalData, current_value: 0, status: 'active' as GoalStatus })
    .select()
    .single();

  if (error) {
    if (error.message.includes('inappropriate language')) {
      return { error: 'Please keep your goal content friendly' };
    }
    return { error: error.message };
  }

  // Insert goal categories
  if (category_ids.length > 0) {
    await supabase.from('goal_categories').insert(
      category_ids.map((category_id) => ({ goal_id: goal.id, category_id }))
    );
  }

  // Auto-create "goal_created" post
  await supabase.from('posts').insert({
    user_id: data.user_id,
    goal_id: goal.id,
    post_type: 'goal_created',
    content: `Started a new goal: ${data.title}`,
  });

  return { goal: goal as Goal };
}

export async function updateGoal(
  goalId: string,
  data: Partial<Pick<Goal, 'title' | 'description' | 'target_value' | 'stakes' | 'effort_label' | 'effort_target' | 'visibility'>>
): Promise<{ error?: string }> {
  const { error } = await supabase.from('goals').update(data).eq('id', goalId);
  if (error) {
    if (error.message.includes('inappropriate language')) {
      return { error: 'Please keep your goal content friendly' };
    }
    return { error: error.message };
  }
  return {};
}

export async function deleteGoal(goalId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) return { error: error.message };
  return {};
}

export async function getGoal(goalId: string): Promise<{ goal?: GoalWithCategories; error?: string }> {
  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_categories(category_id, categories(*))')
    .eq('id', goalId)
    .single();

  if (error) return { error: error.message };

  const categories = (data.goal_categories || []).map(
    (gc: { categories: Category }) => gc.categories
  );

  return { goal: { ...data, categories } as GoalWithCategories };
}

export async function getUserGoals(
  userId: string,
  status?: GoalStatus
): Promise<{ goals: GoalWithCategories[]; error?: string }> {
  let query = supabase
    .from('goals')
    .select('*, goal_categories(category_id, categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return { goals: [], error: error.message };

  const goals = (data || []).map((g: Record<string, unknown>) => ({
    ...g,
    categories: ((g.goal_categories as Array<{ categories: Category }>) || []).map(
      (gc) => gc.categories
    ),
  })) as GoalWithCategories[];

  return { goals };
}

export async function completeGoal(goalId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('goals')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', goalId);

  if (error) return { error: error.message };

  // Get goal title for auto-post
  const { data: goal } = await supabase.from('goals').select('title').eq('id', goalId).single();

  // Auto-create "goal_completed" post
  await supabase.from('posts').insert({
    user_id: userId,
    goal_id: goalId,
    post_type: 'goal_completed',
    content: `Completed: ${goal?.title}`,
  });

  return {};
}

export async function checkGoalCompletion(goalId: string, userId: string): Promise<boolean> {
  const { data: goal } = await supabase
    .from('goals')
    .select('goal_type, target_value, current_value, status')
    .eq('id', goalId)
    .single();

  if (!goal || goal.status === 'completed' || !goal.target_value) return false;
  if (goal.goal_type === 'milestone') return false;

  if (goal.current_value >= goal.target_value) {
    await completeGoal(goalId, userId);
    return true;
  }
  return false;
}

export async function getActiveGoalCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');
  return count ?? 0;
}
