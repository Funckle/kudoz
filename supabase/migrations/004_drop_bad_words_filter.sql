-- Remove bad words filter
-- The word-list approach blocks legitimate positive language ("holy shit, I ran 10k!").
-- Moderation now relies on the existing report system + manual review.
-- Intent-based moderation may be added later.

-- Drop triggers first (they depend on the function)
DROP TRIGGER IF EXISTS check_post_content ON posts;
DROP TRIGGER IF EXISTS check_comment_content ON comments;
DROP TRIGGER IF EXISTS check_goal_content ON goals;

-- Drop the moderation function
DROP FUNCTION IF EXISTS check_content_moderation();

-- Drop the bad words table
DROP TABLE IF EXISTS bad_words;
