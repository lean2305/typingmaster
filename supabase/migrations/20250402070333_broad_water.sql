/*
  # Update leaderboard view

  1. Changes
    - Modify leaderboard view to show all users
    - Remove any filtering conditions
    - Ensure proper ordering by level and words typed

  2. Security
    - Maintain existing security policies
*/

-- Drop the existing view if it exists
DROP VIEW IF EXISTS leaderboard_view;

-- Create the updated view
CREATE VIEW leaderboard_view AS
SELECT
  up.username,
  COALESCE(us.level, 1) as level,
  COALESCE(us.words_typed, 0) as words_typed,
  up.user_id
FROM
  user_profiles up
LEFT JOIN
  user_stats us ON up.user_id = us.user_id
ORDER BY
  COALESCE(us.level, 1) DESC,
  COALESCE(us.words_typed, 0) DESC;

-- Grant access to authenticated users
GRANT SELECT ON leaderboard_view TO authenticated;