-- Kudoz MVP Database Schema
-- Apply via Supabase SQL Editor or migration tool

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES (fixed, seeded)
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  username_changed_at TIMESTAMPTZ,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  website TEXT,
  default_visibility TEXT NOT NULL DEFAULT 'public' CHECK (default_visibility IN ('public', 'friends', 'private')),
  invites_remaining INTEGER NOT NULL DEFAULT 0,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  subscription_status TEXT NOT NULL DEFAULT 'none' CHECK (subscription_status IN ('active', 'lapsed', 'none')),
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  goal_type TEXT NOT NULL CHECK (goal_type IN ('currency', 'count', 'milestone')),
  target_value NUMERIC,
  current_value NUMERIC NOT NULL DEFAULT 0,
  stakes TEXT,
  effort_label TEXT,
  effort_target INTEGER,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- GOAL_CATEGORIES (junction, 1-3 per goal)
-- ============================================================
CREATE TABLE goal_categories (
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, category_id)
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  content TEXT,
  post_type TEXT NOT NULL CHECK (post_type IN ('progress', 'goal_created', 'goal_completed')),
  progress_value NUMERIC,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image')),
  media_width INTEGER,
  media_height INTEGER,
  media_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ
);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================================
-- REACTIONS (Kudoz - one per user per post)
-- ============================================================
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- ============================================================
-- COMMENTS (threaded)
-- ============================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ============================================================
-- REPORTS (polymorphic)
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'user', 'goal')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'impersonation', 'inappropriate_image', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kudoz', 'comment', 'follow', 'mutual_follow', 'goal_completed', 'subscription_expiring', 'subscription_expired')),
  data JSONB NOT NULL DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- ============================================================
-- INVITES
-- ============================================================
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- ============================================================
-- WAITLIST
-- ============================================================
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_at TIMESTAMPTZ
);

-- ============================================================
-- BLOCKS
-- ============================================================
CREATE TABLE blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- ============================================================
-- MUTES
-- ============================================================
CREATE TABLE mutes (
  muter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  muted_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (muter_id, muted_id),
  CHECK (muter_id != muted_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_goal_created ON posts(goal_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_users_fts ON users USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(username, '')));
CREATE INDEX idx_goals_fts ON goals USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_posts_fts ON posts USING gin(to_tsvector('english', coalesce(content, '')));

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories: anyone can read
CREATE POLICY "categories_read" ON categories FOR SELECT USING (true);

-- Users: anyone can read profiles, own can update
CREATE POLICY "users_read" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.uid() = id);

-- Goals: visibility-aware read, owner manages
CREATE POLICY "goals_select" ON goals FOR SELECT USING (
  user_id = auth.uid()
  OR (
    visibility = 'public'
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = goals.user_id AND blocked_id = auth.uid())
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = auth.uid() AND blocked_id = goals.user_id)
  )
  OR (
    visibility = 'friends'
    AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = goals.user_id)
    AND EXISTS (SELECT 1 FROM follows WHERE follower_id = goals.user_id AND following_id = auth.uid())
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = goals.user_id AND blocked_id = auth.uid())
  )
);
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Goal categories: same as goals
CREATE POLICY "goal_categories_select" ON goal_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_categories.goal_id)
);
CREATE POLICY "goal_categories_insert" ON goal_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_categories.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "goal_categories_delete" ON goal_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_categories.goal_id AND goals.user_id = auth.uid())
);

-- Posts: visibility-aware via goal's visibility
CREATE POLICY "posts_select" ON posts FOR SELECT USING (
  user_id = auth.uid()
  OR (
    EXISTS (
      SELECT 1 FROM goals g WHERE g.id = posts.goal_id AND (
        g.visibility = 'public'
        OR (
          g.visibility = 'friends'
          AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = posts.user_id)
          AND EXISTS (SELECT 1 FROM follows WHERE follower_id = posts.user_id AND following_id = auth.uid())
        )
      )
    )
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = posts.user_id AND blocked_id = auth.uid())
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = auth.uid() AND blocked_id = posts.user_id)
    AND NOT EXISTS (SELECT 1 FROM mutes WHERE muter_id = auth.uid() AND muted_id = posts.user_id)
  )
);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Follows: authenticated users can manage their own follows
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (
  auth.uid() = follower_id
  AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = following_id AND blocked_id = auth.uid())
  AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = auth.uid() AND blocked_id = following_id)
);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Reactions: authenticated users
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments: paid users can insert, anyone can read visible posts' comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id)
);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.subscription_status = 'active')
);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Reports: any authenticated user can insert
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Notifications: own only
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Invites: own invites
CREATE POLICY "invites_select" ON invites FOR SELECT USING (auth.uid() = inviter_id OR used_by = auth.uid());
CREATE POLICY "invites_insert" ON invites FOR INSERT WITH CHECK (auth.uid() = inviter_id);

-- Waitlist: anyone can insert
CREATE POLICY "waitlist_insert" ON waitlist FOR INSERT WITH CHECK (true);

-- Blocks: own only
CREATE POLICY "blocks_select" ON blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "blocks_insert" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocks_delete" ON blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Mutes: own only
CREATE POLICY "mutes_select" ON mutes FOR SELECT USING (auth.uid() = muter_id);
CREATE POLICY "mutes_insert" ON mutes FOR INSERT WITH CHECK (auth.uid() = muter_id);
CREATE POLICY "mutes_delete" ON mutes FOR DELETE USING (auth.uid() = muter_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "post_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "post_images_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "post_images_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Check mutual follow
CREATE OR REPLACE FUNCTION check_mutual_follow(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows WHERE follower_id = user_a AND following_id = user_b
  ) AND EXISTS (
    SELECT 1 FROM follows WHERE follower_id = user_b AND following_id = user_a
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get feed posts (chronological, privacy-aware)
CREATE OR REPLACE FUNCTION get_feed_posts(p_user_id UUID, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  id UUID, user_id UUID, goal_id UUID, content TEXT, post_type TEXT,
  progress_value NUMERIC, media_url TEXT, media_type TEXT, media_width INTEGER,
  media_height INTEGER, media_size_bytes INTEGER, created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ, edited_at TIMESTAMPTZ,
  author_id UUID, author_name TEXT, author_username TEXT, author_avatar_url TEXT,
  goal_title TEXT, goal_type TEXT, goal_target_value NUMERIC, goal_current_value NUMERIC, goal_status TEXT,
  kudoz_count BIGINT, comment_count BIGINT, has_kudozd BOOLEAN
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
    COALESCE((SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id), 0) AS kudoz_count,
    COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comment_count,
    EXISTS (SELECT 1 FROM reactions r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS has_kudozd
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

-- Search content
CREATE OR REPLACE FUNCTION search_content(p_query TEXT, p_user_id UUID, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  title TEXT,
  subtitle TEXT,
  avatar_url TEXT,
  rank REAL
) AS $$
DECLARE
  tsquery_val TSQUERY;
BEGIN
  tsquery_val := plainto_tsquery('english', p_query);
  RETURN QUERY
  -- Users
  SELECT 'user'::TEXT, u.id, u.name, u.username, u.avatar_url,
    ts_rank(to_tsvector('english', coalesce(u.name, '') || ' ' || coalesce(u.username, '')), tsquery_val)
  FROM users u
  WHERE to_tsvector('english', coalesce(u.name, '') || ' ' || coalesce(u.username, '')) @@ tsquery_val
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = u.id AND b.blocked_id = p_user_id)
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = p_user_id AND b.blocked_id = u.id)
  UNION ALL
  -- Goals (public only)
  SELECT 'goal'::TEXT, g.id, g.title, g.description, NULL,
    ts_rank(to_tsvector('english', coalesce(g.title, '') || ' ' || coalesce(g.description, '')), tsquery_val)
  FROM goals g
  WHERE to_tsvector('english', coalesce(g.title, '') || ' ' || coalesce(g.description, '')) @@ tsquery_val
    AND g.visibility = 'public'
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = g.user_id AND b.blocked_id = p_user_id)
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = p_user_id AND b.blocked_id = g.user_id)
  UNION ALL
  -- Posts (public goals only)
  SELECT 'post'::TEXT, p.id, p.content, NULL, NULL,
    ts_rank(to_tsvector('english', coalesce(p.content, '')), tsquery_val)
  FROM posts p
  JOIN goals g ON g.id = p.goal_id
  WHERE to_tsvector('english', coalesce(p.content, '')) @@ tsquery_val
    AND g.visibility = 'public'
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = p.user_id AND b.blocked_id = p_user_id)
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = p_user_id AND b.blocked_id = p.user_id)
  ORDER BY rank DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- NOTIFICATION TRIGGERS
-- ============================================================

-- Kudoz notification
CREATE OR REPLACE FUNCTION notify_kudoz() RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
  actor_name TEXT;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
    SELECT name INTO actor_name FROM users WHERE id = NEW.user_id;
    INSERT INTO notifications (user_id, type, data)
    VALUES (post_owner, 'kudoz', jsonb_build_object(
      'post_id', NEW.post_id, 'actor_id', NEW.user_id, 'actor_name', actor_name
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_insert AFTER INSERT ON reactions
FOR EACH ROW EXECUTE FUNCTION notify_kudoz();

-- Comment notification
CREATE OR REPLACE FUNCTION notify_comment() RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
  actor_name TEXT;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
    SELECT name INTO actor_name FROM users WHERE id = NEW.user_id;
    INSERT INTO notifications (user_id, type, data)
    VALUES (post_owner, 'comment', jsonb_build_object(
      'post_id', NEW.post_id, 'comment_id', NEW.id, 'actor_id', NEW.user_id, 'actor_name', actor_name
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_insert AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_comment();

-- Follow notification (+ mutual check)
CREATE OR REPLACE FUNCTION notify_follow() RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  is_mutual BOOLEAN;
BEGIN
  SELECT name INTO actor_name FROM users WHERE id = NEW.follower_id;
  is_mutual := EXISTS (SELECT 1 FROM follows WHERE follower_id = NEW.following_id AND following_id = NEW.follower_id);

  IF is_mutual THEN
    INSERT INTO notifications (user_id, type, data)
    VALUES (NEW.following_id, 'mutual_follow', jsonb_build_object(
      'actor_id', NEW.follower_id, 'actor_name', actor_name
    ));
    INSERT INTO notifications (user_id, type, data)
    VALUES (NEW.follower_id, 'mutual_follow', jsonb_build_object(
      'actor_id', NEW.following_id, 'actor_name', (SELECT name FROM users WHERE id = NEW.following_id)
    ));
  ELSE
    INSERT INTO notifications (user_id, type, data)
    VALUES (NEW.following_id, 'follow', jsonb_build_object(
      'actor_id', NEW.follower_id, 'actor_name', actor_name
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_insert AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION notify_follow();

-- Goal completed notification (notify followers)
CREATE OR REPLACE FUNCTION notify_goal_completed() RETURNS TRIGGER AS $$
DECLARE
  owner_name TEXT;
  follower RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT name INTO owner_name FROM users WHERE id = NEW.user_id;
    FOR follower IN SELECT follower_id FROM follows WHERE following_id = NEW.user_id LOOP
      INSERT INTO notifications (user_id, type, data)
      VALUES (follower.follower_id, 'goal_completed', jsonb_build_object(
        'goal_id', NEW.id, 'goal_title', NEW.title, 'actor_id', NEW.user_id, 'actor_name', owner_name
      ));
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_goal_completed AFTER UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION notify_goal_completed();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO categories (id, name, icon, color) VALUES
  (uuid_generate_v4(), 'Fitness', 'dumbbell', '#F97316'),
  (uuid_generate_v4(), 'Health', 'heart-pulse', '#14B8A6'),
  (uuid_generate_v4(), 'Learning', 'book-open', '#3B82F6'),
  (uuid_generate_v4(), 'Finance', 'wallet', '#22C55E'),
  (uuid_generate_v4(), 'Career', 'briefcase', '#64748B'),
  (uuid_generate_v4(), 'Habits', 'repeat', '#A855F7'),
  (uuid_generate_v4(), 'Creative', 'palette', '#EC4899'),
  (uuid_generate_v4(), 'Life', 'sun', '#F59E0B')
ON CONFLICT (name) DO NOTHING;
