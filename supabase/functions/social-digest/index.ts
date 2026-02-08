import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cron: every Friday 6pm UTC
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all active users
  const { data: users } = await supabase
    .from('users')
    .select('id');

  let sent = 0;

  for (const user of users || []) {
    // Get users this person follows
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (!following || following.length === 0) continue;

    const followingIds = following.map((f) => f.following_id);

    // Count how many followed users posted this week
    const { data: posters } = await supabase
      .from('posts')
      .select('user_id')
      .in('user_id', followingIds)
      .gte('created_at', oneWeekAgo);

    const uniquePosters = new Set((posters || []).map((p) => p.user_id));
    const count = uniquePosters.size;

    if (count === 0) continue;

    const message = `${count} friend${count !== 1 ? 's' : ''} made progress this week`;

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'social_digest',
      data: { message },
    });
    sent++;
  }

  return new Response(JSON.stringify({ success: true, sent }), { status: 200 });
});
