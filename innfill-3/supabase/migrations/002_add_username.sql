-- Add username field to profiles table
-- Step 1: Add as nullable first to handle existing users
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Step 2: Generate usernames for existing users from display_name or email
UPDATE profiles
SET username = LOWER(REGEXP_REPLACE(COALESCE(display_name, SPLIT_PART(email, '@', 1)), '[^a-z0-9_]', '', 'g'))
WHERE username IS NULL;

-- Step 3: Make username required and add constraints
ALTER TABLE profiles
ALTER COLUMN username SET NOT NULL;

-- Add check constraint for username format (lowercase alphanumeric and underscores, 3-30 characters)
ALTER TABLE profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add comment
COMMENT ON COLUMN profiles.username IS 'Unique username for profile URLs, lowercase alphanumeric and underscores only, 3-30 characters';
