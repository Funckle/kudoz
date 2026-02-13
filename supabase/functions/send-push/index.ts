import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  data: Record<string, unknown>;
}

function getNotificationContent(notification: NotificationRecord): { title: string; body: string } {
  const data = notification.data;
  const actorName = (data.actor_name as string) || 'Someone';

  switch (notification.type) {
    case 'kudos':
      return { title: 'Kudos!', body: `${actorName} gave you Kudos` };
    case 'comment':
      return { title: 'New Comment', body: `${actorName} commented on your post` };
    case 'follow':
      return { title: 'New Follower', body: `${actorName} followed you` };
    case 'mutual_follow':
      return { title: 'Mutual Follow', body: `You and ${actorName} are now mutual followers` };
    case 'goal_completed':
      return { title: 'Goal Completed!', body: `${actorName} completed: ${(data.goal_title as string) || 'a goal'}` };
    case 'subscription_expiring':
      return { title: 'Subscription Expiring', body: 'Your subscription expires soon' };
    case 'subscription_expired':
      return { title: 'Subscription Expired', body: 'Your subscription has expired' };
    case 'weekly_summary':
      return { title: 'Weekly Summary', body: (data.message as string) || 'Check your weekly progress' };
    case 'social_digest':
      return { title: 'Friend Activity', body: (data.message as string) || 'Your friends made progress this week' };
    case 'quarterly_reflection':
      return { title: 'Quarterly Reflection', body: (data.message as string) || 'Reflect on your progress' };
    case 'milestone_reached':
      return { title: 'Milestone Reached!', body: (data.message as string) || "You've hit your target!" };
    case 'target_date_reached':
      return { title: 'Goal Check-in', body: (data.message as string) || 'Your goal target date has arrived' };
    case 'moderation_warning':
      return { title: 'Account Notice', body: (data.reason as string) || 'You have received a warning regarding your account activity' };
    case 'moderation_suspension': {
      const days = data.days as number;
      return { title: 'Account Suspended', body: `Your account has been suspended for ${days} day${days === 1 ? '' : 's'}` };
    }
    case 'moderation_ban':
      return { title: 'Account Banned', body: 'Your account has been permanently banned' };
    default:
      return { title: 'Mokudos', body: 'You have a new notification' };
  }
}

serve(async (req) => {
  try {
    const { record } = await req.json() as { record: NotificationRecord };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user's push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', record.user_id);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: 'No push tokens found' }), { status: 200 });
    }

    const { title, body } = getNotificationContent(record);

    // Send to all user devices via Expo Push API
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data: {
        type: record.type,
        ...record.data,
      },
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    // Mark notification as delivered
    await supabase
      .from('notifications')
      .update({ delivered_at: new Date().toISOString() })
      .eq('id', record.id);

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
