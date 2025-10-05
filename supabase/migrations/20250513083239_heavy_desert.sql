/*
  # Fix user stats policies

  1. Changes
    - Add INSERT policy for user_stats table
    - Modify existing policies to handle initial creation
    - Add default values for new stats

  2. Security
    - Enable RLS on user_stats table
    - Add policies for authenticated users to:
      - Insert their own stats
      - Read their own stats
      - Update their own stats
*/

-- Ensure RLS is enabled
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

-- Create comprehensive policies
CREATE POLICY "Users can read own stats"
ON user_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON user_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add default values for new columns if they don't exist
DO $$ 
BEGIN
  ALTER TABLE user_stats ALTER COLUMN level SET DEFAULT 1;
  ALTER TABLE user_stats ALTER COLUMN exp SET DEFAULT 0;
  ALTER TABLE user_stats ALTER COLUMN words_typed SET DEFAULT 0;
  ALTER TABLE user_stats ALTER COLUMN time_spent SET DEFAULT 0;
  ALTER TABLE user_stats ALTER COLUMN accuracy SET DEFAULT 100;
  ALTER TABLE user_stats ALTER COLUMN wpm SET DEFAULT 0;
EXCEPTION
  WHEN others THEN NULL;
END $$;