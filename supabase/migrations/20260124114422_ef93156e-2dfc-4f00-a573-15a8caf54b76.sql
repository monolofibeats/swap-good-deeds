-- Add Discord-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS discord_user_id TEXT,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_global_name TEXT,
ADD COLUMN IF NOT EXISTS discord_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS discord_linked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS display_name_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS avatar_source TEXT DEFAULT 'manual';

-- Add unique constraint on discord_user_id to prevent duplicate linking
CREATE UNIQUE INDEX IF NOT EXISTS profiles_discord_user_id_unique 
ON public.profiles(discord_user_id) 
WHERE discord_user_id IS NOT NULL;