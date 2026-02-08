-- ============================================================
-- COMMENT REACTIONS (Kudoz on comments - one per user per comment)
-- ============================================================
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);

-- RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comment_reactions_select" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "comment_reactions_insert" ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_reactions_delete" ON comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- Add 'comment_kudoz' to notification type constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'kudoz', 'comment', 'follow', 'mutual_follow', 'goal_completed',
    'subscription_expiring', 'subscription_expired',
    'weekly_summary', 'social_digest', 'quarterly_reflection',
    'milestone_reached', 'target_date_reached',
    'comment_kudoz'
  ));

-- Notification trigger for comment kudoz
CREATE OR REPLACE FUNCTION notify_comment_kudoz() RETURNS TRIGGER AS $$
DECLARE
  comment_owner UUID;
  comment_post_id UUID;
  actor_name TEXT;
BEGIN
  SELECT user_id, post_id INTO comment_owner, comment_post_id
    FROM comments WHERE id = NEW.comment_id;
  IF comment_owner IS NOT NULL AND comment_owner != NEW.user_id THEN
    SELECT name INTO actor_name FROM users WHERE id = NEW.user_id;
    INSERT INTO notifications (user_id, type, data)
    VALUES (comment_owner, 'comment_kudoz', jsonb_build_object(
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
FOR EACH ROW EXECUTE FUNCTION notify_comment_kudoz();
