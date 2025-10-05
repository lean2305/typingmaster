/*
  # Create leaderboard view

  1. New View
    - `leaderboard_view`
      - Combines data from `user_profiles` and `user_stats`
      - Provides a simplified view for leaderboard queries
  
  2. Security
    - Add appropriate permissions for authenticated users to read leaderboard data
*/

-- Create a view for the leaderboard to simplify queries
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  up.username,
  us.level,
  us.words_typed,
  us.user_id
FROM
  user_profiles up
JOIN
  user_stats us ON up.user_id = us.user_id
ORDER BY
  us.level DESC,
  us.words_typed DESC;

-- Grant access to authenticated users
GRANT SELECT ON leaderboard_view TO authenticated;

-- Create an index to improve leaderboard query performance
CREATE INDEX IF NOT EXISTS user_stats_level_words_typed_idx ON user_stats (level DESC, words_typed DESC);
