import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Daily cron — checks for milestone goals that have reached their target
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find milestone goals where current_value >= effort_target and still active
  const { data: milestoneGoals } = await supabase
    .from('goals')
    .select('id, user_id, title, effort_target, current_value')
    .eq('goal_type', 'milestone')
    .eq('status', 'active')
    .not('effort_target', 'is', null);

  let notificationCount = 0;

  for (const goal of milestoneGoals || []) {
    if (goal.current_value < (goal.effort_target || 0)) continue;

    // Check if we already sent this notification
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', goal.user_id)
      .eq('type', 'milestone_reached')
      .filter('data->>goal_id', 'eq', goal.id)
      .maybeSingle();

    if (existing) continue;

    await supabase.from('notifications').insert({
      user_id: goal.user_id,
      type: 'milestone_reached',
      data: {
        goal_id: goal.id,
        goal_title: goal.title,
        message: `You've hit your target on "${goal.title}"! Ready to mark it complete?`,
      },
    });
    notificationCount++;
  }

  // Also check for goals where target date has passed (using completed_at as proxy for target date)
  // Goals with a target_value where current date > created_at + reasonable duration
  // For now, we just handle the milestone case above

  return new Response(JSON.stringify({ success: true, notificationsSent: notificationCount }), {
    status: 200,
  });
});
