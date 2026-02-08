-- ============================================================
-- 005: Enforce server-side rate limits, audit logging, RLS
-- ============================================================

-- -------------------------------------------------------
-- 1. Rate-limit trigger functions (call check_rate_limit)
-- -------------------------------------------------------

-- Posts: max 5 per 10 minutes
CREATE OR REPLACE FUNCTION enforce_post_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_rate_limit(NEW.user_id, 'post', 5, 600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many posts. Please wait before posting again.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_rate_limit
  BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION enforce_post_rate_limit();

-- Reactions: max 30 per minute
CREATE OR REPLACE FUNCTION enforce_reaction_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_rate_limit(NEW.user_id, 'reaction', 30, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many reactions. Please slow down.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reaction_rate_limit
  BEFORE INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION enforce_reaction_rate_limit();

-- Reports: max 10 per day (86400 seconds)
CREATE OR REPLACE FUNCTION enforce_report_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_rate_limit(NEW.reporter_id, 'report', 10, 86400) THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many reports today. Please try again later.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_report_rate_limit
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION enforce_report_rate_limit();

-- Comments: max 10 per 5 minutes
CREATE OR REPLACE FUNCTION enforce_comment_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_rate_limit(NEW.user_id, 'comment', 10, 300) THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many comments. Please wait before commenting again.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_rate_limit
  BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION enforce_comment_rate_limit();

-- Invite redemption: max 5 per hour (triggered on UPDATE when used_by changes)
CREATE OR REPLACE FUNCTION enforce_invite_redeem_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only enforce when an invite is being redeemed (used_by set from NULL)
  IF OLD.used_by IS NULL AND NEW.used_by IS NOT NULL THEN
    IF NOT check_rate_limit(NEW.used_by, 'invite_redeem', 5, 3600) THEN
      RAISE EXCEPTION 'Rate limit exceeded: too many invite redemptions. Please try again later.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invite_redeem_rate_limit
  BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION enforce_invite_redeem_rate_limit();

-- -------------------------------------------------------
-- 2. Cleanup function for rate_limits (prune > 24 hours)
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- 3. RLS on rate_limits (users can only see their own)
-- -------------------------------------------------------

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for clients — only server functions write to this table

-- -------------------------------------------------------
-- 4. Deletion audit log (GDPR compliance)
-- -------------------------------------------------------

CREATE TABLE deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deletion_type TEXT DEFAULT 'user_initiated'
);

-- No RLS — admin-only table, block all client access
ALTER TABLE deletion_log ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all policy for clients
CREATE POLICY "No client access"
  ON deletion_log FOR ALL
  USING (false);

-- Trigger to log deletions before they happen
CREATE OR REPLACE FUNCTION log_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deletion_log (user_id, email, deletion_type)
  VALUES (OLD.id, OLD.email, 'user_initiated');
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_user_deletion
  BEFORE DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_user_deletion();
