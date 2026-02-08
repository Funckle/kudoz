import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cron: every Monday 9am UTC
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get all active users (logged in within the last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .gte('created_at', thirtyDaysAgo);

  let sent = 0;

  for (const user of users || []) {
    // Count goals completed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [{ count: completed }, { count: inProgress }] = await Promise.all([
      supabase
        .from('goals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startOfMonth.toISOString()),
      supabase
        .from('goals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active'),
    ]);

    const c = completed ?? 0;
    const ip = inProgress ?? 0;

    if (c === 0 && ip === 0) continue;

    const message = c > 0
      ? `You completed ${c} goal${c !== 1 ? 's' : ''} this month. ${ip} still in progress.`
      : `You have ${ip} goal${ip !== 1 ? 's' : ''} in progress. Keep going!`;

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'weekly_summary',
      data: { message },
    });
    sent++;
  }

  return new Response(JSON.stringify({ success: true, sent }), { status: 200 });
});
