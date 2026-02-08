-- ============================================================
-- ADMIN MODERATION & PROGRESSIVE DISCIPLINE
-- ============================================================

-- Add role and suspension fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- MODERATION ACTIONS (append-only audit log)
-- ============================================================
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('warn', 'remove_content', 'suspend', 'ban', 'dismiss', 'lift_suspension')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_target_user ON moderation_actions(target_user_id);
CREATE INDEX idx_moderation_actions_created ON moderation_actions(created_at DESC);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================================
-- RLS for moderation_actions
-- ============================================================
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- Moderators and admins can view all moderation actions
CREATE POLICY "moderation_actions_select" ON moderation_actions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Moderators and admins can insert moderation actions (append-only: no update/delete)
CREATE POLICY "moderation_actions_insert" ON moderation_actions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- ============================================================
-- RLS updates for reports
-- ============================================================

-- Drop existing reports policies and replace with role-aware ones
DROP POLICY IF EXISTS "reports_insert" ON reports;

-- Reporters can still insert their own reports
CREATE POLICY "reports_insert" ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters see own reports, moderators/admins see all
CREATE POLICY "reports_select" ON reports FOR SELECT
  USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Moderators/admins can update reports (change status, reviewed_at)
CREATE POLICY "reports_update" ON reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- ============================================================
-- RLS update for users (allow moderator/admin to update any user)
-- ============================================================
CREATE POLICY "users_admin_update" ON users FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- ============================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Check if user is suspended (trigger function)
CREATE OR REPLACE FUNCTION check_user_suspension()
RETURNS TRIGGER AS $$
DECLARE
  user_suspended_until TIMESTAMPTZ;
BEGIN
  SELECT suspended_until INTO user_suspended_until
  FROM users WHERE id = NEW.user_id;

  IF user_suspended_until IS NOT NULL AND user_suspended_until > NOW() THEN
    RAISE EXCEPTION 'Your account is suspended until %', user_suspended_until;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Count punitive actions for a user
CREATE OR REPLACE FUNCTION get_violation_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM moderation_actions
  WHERE target_user_id = p_user_id
    AND action_type IN ('warn', 'remove_content', 'suspend', 'ban');
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: remove content (post or comment)
CREATE OR REPLACE FUNCTION admin_remove_content(
  p_content_type TEXT,
  p_content_id UUID,
  p_moderator_id UUID
)
RETURNS VOID AS $$
DECLARE
  mod_role TEXT;
BEGIN
  SELECT role INTO mod_role FROM users WHERE id = p_moderator_id;
  IF mod_role IS NULL OR mod_role NOT IN ('moderator', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: moderator role required';
  END IF;

  IF p_content_type = 'post' THEN
    DELETE FROM posts WHERE id = p_content_id;
  ELSIF p_content_type = 'comment' THEN
    DELETE FROM comments WHERE id = p_content_id;
  ELSE
    RAISE EXCEPTION 'Unsupported content type: %', p_content_type;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: suspend user
CREATE OR REPLACE FUNCTION admin_suspend_user(
  p_target_user_id UUID,
  p_moderator_id UUID,
  p_suspended_until TIMESTAMPTZ,
  p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
  mod_role TEXT;
BEGIN
  SELECT role INTO mod_role FROM users WHERE id = p_moderator_id;
  IF mod_role IS NULL OR mod_role NOT IN ('moderator', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: moderator role required';
  END IF;

  UPDATE users
  SET suspended_until = p_suspended_until,
      suspension_reason = p_reason
  WHERE id = p_target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SUSPENSION CHECK TRIGGERS
-- ============================================================
CREATE TRIGGER trg_posts_suspension_check
  BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION check_user_suspension();

CREATE TRIGGER trg_comments_suspension_check
  BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_user_suspension();

CREATE TRIGGER trg_reactions_suspension_check
  BEFORE INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION check_user_suspension();

-- ============================================================
-- NOTIFICATION TYPES UPDATE
-- ============================================================
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'kudoz', 'comment', 'comment_kudoz', 'follow', 'mutual_follow', 'goal_completed',
    'subscription_expiring', 'subscription_expired',
    'weekly_summary', 'social_digest', 'quarterly_reflection',
    'milestone_reached', 'target_date_reached',
    'moderation_warning', 'moderation_suspension', 'moderation_ban'
  ));
