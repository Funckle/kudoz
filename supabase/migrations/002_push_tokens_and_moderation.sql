-- Push tokens table (supports multi-device per user)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

-- RLS for push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bad words table for server-side moderation
CREATE TABLE IF NOT EXISTS bad_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with initial bad words
INSERT INTO bad_words (word) VALUES
  ('fuck'), ('shit'), ('ass'), ('bitch'), ('damn'), ('dick'), ('pussy'), ('cock'),
  ('cunt'), ('bastard'), ('slut'), ('whore'), ('fag'), ('faggot'),
  ('retard'), ('retarded')
ON CONFLICT (word) DO NOTHING;

-- Content moderation function
CREATE OR REPLACE FUNCTION check_content_moderation()
RETURNS TRIGGER AS $$
DECLARE
  content_text TEXT;
  bad_word RECORD;
BEGIN
  -- Determine which column to check
  IF TG_TABLE_NAME = 'goals' THEN
    content_text := COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '');
  ELSIF TG_TABLE_NAME = 'posts' THEN
    content_text := COALESCE(NEW.content, '');
  ELSIF TG_TABLE_NAME = 'comments' THEN
    content_text := COALESCE(NEW.content, '');
  ELSE
    RETURN NEW;
  END IF;

  -- Skip if no content
  IF content_text = '' OR content_text = ' ' THEN
    RETURN NEW;
  END IF;

  content_text := lower(content_text);

  -- Check against bad_words table using word boundary matching
  FOR bad_word IN SELECT word FROM bad_words LOOP
    IF content_text ~* ('\m' || bad_word.word || '\M') THEN
      RAISE EXCEPTION 'Content contains inappropriate language';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER check_post_content
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION check_content_moderation();

CREATE TRIGGER check_comment_content
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION check_content_moderation();

CREATE TRIGGER check_goal_content
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION check_content_moderation();

-- Rate limits table for server-side tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action, created_at);

-- Rate limit check function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_actions INT,
  p_window_seconds INT
)
RETURNS BOOLEAN AS $$
DECLARE
  action_count INT;
BEGIN
  SELECT COUNT(*) INTO action_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action = p_action
    AND created_at > now() - (p_window_seconds || ' seconds')::INTERVAL;

  IF action_count >= p_max_actions THEN
    RETURN FALSE;
  END IF;

  INSERT INTO rate_limits (user_id, action) VALUES (p_user_id, p_action);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add new notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'kudoz', 'comment', 'follow', 'mutual_follow', 'goal_completed',
    'subscription_expiring', 'subscription_expired',
    'weekly_summary', 'social_digest', 'quarterly_reflection',
    'milestone_reached', 'target_date_reached'
  ));
