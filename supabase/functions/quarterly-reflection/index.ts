import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cron: Jan 1, Apr 1, Jul 1, Oct 1
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Calculate last quarter date range
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const quarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
  const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 1);

  // Handle year boundary (Q1 looks at previous year Q4)
  if (currentQuarter === 0) {
    quarterStart.setFullYear(now.getFullYear() - 1);
    quarterStart.setMonth(9); // October
    quarterEnd.setFullYear(now.getFullYear());
    quarterEnd.setMonth(0); // January
  }

  const { data: users } = await supabase
    .from('users')
    .select('id');

  let sent = 0;

  for (const user of users || []) {
    const { count } = await supabase
      .from('goals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('completed_at', quarterStart.toISOString())
      .lt('completed_at', quarterEnd.toISOString());

    const completed = count ?? 0;

    const message = completed > 0
      ? `You completed ${completed} goal${completed !== 1 ? 's' : ''} last quarter. What goals are you most proud of?`
      : 'What goals are you most proud of from the last 3 months?';

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'quarterly_reflection',
      data: { message },
    });
    sent++;
  }

  return new Response(JSON.stringify({ success: true, sent }), { status: 200 });
});
