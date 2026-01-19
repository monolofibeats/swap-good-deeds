-- Add unique username field (like Discord's unique usernames)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add user_type to profiles (helper = does quests/listings, supporter = provides services/rewards)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE public.user_type AS ENUM ('helper', 'supporter');
  END IF;
END$$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type public.user_type;

-- Add onboarding_completed flag
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create a function to generate unique username from display name
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_name TEXT;
  candidate TEXT;
  suffix INT := 0;
BEGIN
  -- Clean the base name: lowercase, replace spaces with dots, remove special chars
  clean_name := LOWER(REGEXP_REPLACE(base_name, '[^a-zA-Z0-9]', '.', 'g'));
  clean_name := REGEXP_REPLACE(clean_name, '\.+', '.', 'g'); -- Remove consecutive dots
  clean_name := TRIM(BOTH '.' FROM clean_name); -- Remove leading/trailing dots
  
  -- If empty, use a default
  IF clean_name = '' THEN
    clean_name := 'user';
  END IF;
  
  -- Try the base name first
  candidate := clean_name;
  
  -- Keep incrementing suffix until we find a unique one
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    suffix := suffix + 1;
    candidate := clean_name || suffix::TEXT;
  END LOOP;
  
  RETURN candidate;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update trigger to auto-generate username on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL THEN
    NEW.username := public.generate_unique_username(NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS set_profile_username ON public.profiles;
CREATE TRIGGER set_profile_username
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_username();

-- Generate usernames for existing profiles that don't have one
UPDATE public.profiles 
SET username = public.generate_unique_username(display_name)
WHERE username IS NULL;