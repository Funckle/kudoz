-- ============================================================
-- REBRAND: Kudoz → Mokudos (app) / Kudos (reaction)
-- ============================================================

-- 1. Migrate existing notification data
UPDATE notifications SET type = 'kudos' WHERE type = 'kudoz';
UPDATE notifications SET type = 'comment_kudos' WHERE type = 'comment_kudoz';

-- 2. Drop + recreate notification type CHECK constraint with new values
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'kudos', 'comment', 'comment_kudos', 'follow', 'mutual_follow', 'goal_completed',
    'subscription_expiring', 'subscription_expired',
    'weekly_summary', 'social_digest', 'quarterly_reflection',
    'milestone_reached', 'target_date_reached',
    'moderation_warning', 'moderation_suspension', 'moderation_ban'
  ));

-- 3. Drop + recreate get_feed_posts() with kudos_count and has_given_kudos aliases
DROP FUNCTION IF EXISTS get_feed_posts(UUID, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_feed_posts(p_user_id UUID, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  id UUID, user_id UUID, goal_id UUID, content TEXT, post_type TEXT,
  progress_value NUMERIC, media_url TEXT, media_type TEXT, media_width INTEGER,
  media_height INTEGER, media_size_bytes INTEGER, created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ, edited_at TIMESTAMPTZ,
  author_id UUID, author_name TEXT, author_username TEXT, author_avatar_url TEXT,
  goal_title TEXT, goal_type TEXT, goal_target_value NUMERIC, goal_current_value NUMERIC, goal_status TEXT,
  kudos_count BIGINT, comment_count BIGINT, has_given_kudos BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.user_id, p.goal_id, p.content, p.post_type,
    p.progress_value, p.media_url, p.media_type, p.media_width,
    p.media_height, p.media_size_bytes, p.created_at,
    p.updated_at, p.edited_at,
    u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar_url AS author_avatar_url,
    g.title AS goal_title, g.goal_type AS goal_type, g.target_value AS goal_target_value,
    g.current_value AS goal_current_value, g.status AS goal_status,
    COALESCE((SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id), 0) AS kudos_count,
    COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comment_count,
    EXISTS (SELECT 1 FROM reactions r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS has_given_kudos
  FROM posts p
  JOIN users u ON u.id = p.user_id
  JOIN goals g ON g.id = p.goal_id
  WHERE (
    p.user_id = p_user_id
    OR (
      EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = p_user_id AND f.following_id = p.user_id)
      AND (
        g.visibility = 'public'
        OR (
          g.visibility = 'friends'
          AND EXISTS (SELECT 1 FROM follows f2 WHERE f2.follower_id = p.user_id AND f2.following_id = p_user_id)
        )
      )
    )
  )
  AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = p.user_id AND b.blocked_id = p_user_id)
  AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = p_user_id AND b.blocked_id = p.user_id)
  AND NOT EXISTS (SELECT 1 FROM mutes m WHERE m.muter_id = p_user_id AND m.muted_id = p.user_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Replace notify_kudoz() → notify_kudos()
DROP TRIGGER IF EXISTS on_reaction_insert ON reactions;

CREATE OR REPLACE FUNCTION notify_kudos() RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
  actor_name TEXT;
BEGIN
  SELECT p_inner.user_id INTO post_owner FROM posts p_inner WHERE p_inner.id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
    SELECT u.name INTO actor_name FROM users u WHERE u.id = NEW.user_id;
    INSERT INTO notifications (user_id, type, data)
    VALUES (post_owner, 'kudos', jsonb_build_object(
      'post_id', NEW.post_id, 'actor_id', NEW.user_id, 'actor_name', actor_name
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_insert AFTER INSERT ON reactions
FOR EACH ROW EXECUTE FUNCTION notify_kudos();

DROP FUNCTION IF EXISTS notify_kudoz();

-- 5. Replace notify_comment_kudoz() → notify_comment_kudos()
DROP TRIGGER IF EXISTS on_comment_reaction_insert ON comment_reactions;

CREATE OR REPLACE FUNCTION notify_comment_kudos() RETURNS TRIGGER AS $$
DECLARE
  comment_owner UUID;
  comment_post_id UUID;
  actor_name TEXT;
BEGIN
  SELECT c.user_id, c.post_id INTO comment_owner, comment_post_id
    FROM comments c WHERE c.id = NEW.comment_id;
  IF comment_owner IS NOT NULL AND comment_owner != NEW.user_id THEN
    SELECT u.name INTO actor_name FROM users u WHERE u.id = NEW.user_id;
    INSERT INTO notifications (user_id, type, data)
    VALUES (comment_owner, 'comment_kudos', jsonb_build_object(
      'comment_id', NEW.comment_id,
      'post_id', comment_post_id,
      'actor_id', NEW.user_id,
      'actor_name', actor_name
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_reaction_insert AFTER INSERT ON comment_reactions
FOR EACH ROW EXECUTE FUNCTION notify_comment_kudos();

DROP FUNCTION IF EXISTS notify_comment_kudoz();
