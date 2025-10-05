/*
  # Achievements System

  1. New Tables
    - `achievements` - Stores all available achievements
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `requirement_type` (text) - Type of requirement (e.g., 'wpm', 'words_typed', 'accuracy')
      - `requirement_value` (integer) - Value needed to unlock
      - `created_at` (timestamptz)
    
    - `user_achievements` - Tracks which achievements users have unlocked
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `achievement_id` (uuid, references achievements)
      - `unlocked_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id uuid REFERENCES achievements NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements table
CREATE POLICY "Anyone can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_achievements table
CREATE POLICY "Users can read their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value)
VALUES
  ('Speed Demon', 'Type at a speed of 50 WPM', 'zap', 'wpm', 50),
  ('Lightning Fingers', 'Type at a speed of 80 WPM', 'zap', 'wpm', 80),
  ('Word Wizard', 'Type 1000 words total', 'book-open', 'words_typed', 1000),
  ('Typing Marathon', 'Type 5000 words total', 'book-open', 'words_typed', 5000),
  ('Perfect Streak', 'Achieve 100% accuracy in a session', 'check-circle', 'accuracy', 100),
  ('Dedicated Typist', 'Spend 60 minutes typing', 'clock', 'time_spent', 3600),
  ('Level Master', 'Reach level 10', 'award', 'level', 10),
  ('Keyboard Warrior', 'Reach level 20', 'award', 'level', 20)
ON CONFLICT (name) DO NOTHING;

-- Create a function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
BEGIN
  -- Check each achievement type
  FOR achievement_record IN 
    SELECT * FROM achievements
    WHERE 
      (requirement_type = 'wpm' AND requirement_value <= NEW.wpm) OR
      (requirement_type = 'words_typed' AND requirement_value <= NEW.words_typed) OR
      (requirement_type = 'accuracy' AND requirement_value <= NEW.accuracy) OR
      (requirement_type = 'time_spent' AND requirement_value <= NEW.time_spent) OR
      (requirement_type = 'level' AND requirement_value <= NEW.level)
  LOOP
    -- Insert achievement if not already awarded
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement_record.id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_stats table
DROP TRIGGER IF EXISTS check_achievements_trigger ON user_stats;
CREATE TRIGGER check_achievements_trigger
AFTER UPDATE ON user_stats
FOR EACH ROW
EXECUTE FUNCTION check_achievements();

-- Add accuracy column to user_stats if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' 
    AND column_name = 'accuracy'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN accuracy integer DEFAULT 0;
  END IF;
END $$;

-- Add wpm column to user_stats if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' 
    AND column_name = 'wpm'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN wpm integer DEFAULT 0;
  END IF;
END $$;