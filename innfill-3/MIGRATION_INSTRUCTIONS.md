# Username Migration Instructions

## Overview
The profile system has been updated to use usernames (e.g., `/profile/mani`) instead of user IDs (e.g., `/profile/uuid`).

## Database Migration Required

You need to run the migration file located at:
```
supabase/migrations/002_add_username.sql
```

### Steps to Apply Migration:

#### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/002_add_username.sql`
4. Paste and run the SQL

#### Option 2: Using Supabase CLI
```bash
# Make sure you're in the innfill-3 directory
cd innfill-3

# Apply the migration
supabase db push
```

## Migration Details

The migration adds:
- `username` column (TEXT, UNIQUE, NOT NULL)
- Username format validation (lowercase letters, numbers, underscores only)
- Length constraint (3-30 characters)
- Index for fast username lookups

## Important Notes

⚠️ **Existing Users**: If you have existing users in your database, you'll need to:
1. Either update the migration to make username nullable initially
2. Create a script to generate usernames for existing users
3. Then alter the column to NOT NULL

### Example script for existing users:
```sql
-- If you have existing users, run this BEFORE the migration:

-- First, make username nullable
ALTER TABLE profiles
ADD COLUMN username TEXT UNIQUE;

-- Generate usernames for existing users (customize as needed)
UPDATE profiles
SET username = LOWER(REPLACE(REPLACE(display_name, ' ', '_'), '@', ''))
WHERE username IS NULL;

-- Add constraints
ALTER TABLE profiles
ALTER COLUMN username SET NOT NULL;

ALTER TABLE profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
```

## Changes Made

### 1. Database Schema
- ✅ Added username column to profiles table
- ✅ Added unique constraint on username
- ✅ Added format validation (^[a-z0-9_]{3,30}$)
- ✅ Added index for performance

### 2. TypeScript Types
- ✅ Updated `Profile` interface to include `username: string`

### 3. Authentication
- ✅ Updated register validation schema to require username
- ✅ Updated register form to include username field with auto-lowercase
- ✅ Updated signup function to check username availability
- ✅ Updated signup function to save username to profile

### 4. Profile Pages
- ✅ Updated `/profile/[username]` to fetch by username instead of ID
- ✅ Updated navbar links to use username instead of user ID

## Testing Checklist

After applying the migration:

- [ ] Register a new user with a username
- [ ] Verify username validation (3-30 chars, lowercase, no special chars except _)
- [ ] Try registering with duplicate username (should fail)
- [ ] Visit profile at `/profile/yourusername`
- [ ] Check navbar profile link works correctly
- [ ] Test that username appears correctly in URLs

## Username Requirements

Users must create a username that:
- Is 3-30 characters long
- Contains only lowercase letters (a-z)
- Contains only numbers (0-9)
- Contains only underscores (_)
- Is unique across all users
- No special characters like @, -, spaces, etc.

Examples:
- ✅ `mani` (valid)
- ✅ `john_doe` (valid)
- ✅ `user123` (valid)
- ❌ `ab` (too short)
- ❌ `John_Doe` (has uppercase)
- ❌ `john-doe` (has hyphen)
- ❌ `john@doe` (has @ symbol)
