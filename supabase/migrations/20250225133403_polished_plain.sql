/*
  # Create user stats table and policies

  1. New Tables
    - `user_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `level` (integer, default 1)
      - `exp` (integer, default 0)
      - `words_typed` (integer, default 0)
      - `time_spent` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_stats` table
    - Add policies for users to read and update their own stats
*/

-- Create the user_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  level integer DEFAULT 1,
  exp integer DEFAULT 0,
  words_typed integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create read policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Users can read own stats'
  ) THEN
    CREATE POLICY "Users can read own stats"
      ON user_stats
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create update policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Users can update own stats'
  ) THEN
    CREATE POLICY "Users can update own stats"
      ON user_stats
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;