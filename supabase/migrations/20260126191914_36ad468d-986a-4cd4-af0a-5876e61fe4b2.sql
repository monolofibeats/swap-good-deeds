-- Add unique constraint on discord_user_id to ensure one Discord account = one SWAP user
-- Using a partial unique index to allow multiple NULL values
CREATE UNIQUE INDEX IF NOT EXISTS profiles_discord_user_id_unique 
ON public.profiles (discord_user_id) 
WHERE discord_user_id IS NOT NULL;