-- Add XP and avatar fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create badges enum
CREATE TYPE public.badge_type AS ENUM (
  'first_quest', 
  'cleanup_hero', 
  'good_samaritan', 
  'community_star', 
  'eco_warrior', 
  'helper_badge',
  'referral_champion',
  'level_5',
  'level_10',
  'level_25'
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type badge_type NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
ON public.user_badges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT favorites_one_type CHECK (
    (quest_id IS NOT NULL AND listing_id IS NULL) OR 
    (quest_id IS NULL AND listing_id IS NOT NULL)
  ),
  UNIQUE(user_id, quest_id),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  points_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_user_id);

-- Add referral_code to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Function to generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_profile_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  NEW.referral_code := result;
  RETURN NEW;
END;
$$;

-- Trigger to generate referral code
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_profile_referral_code();

-- Generate referral codes for existing profiles
UPDATE public.profiles 
SET referral_code = substr(md5(random()::text), 1, 6)
WHERE referral_code IS NULL;

-- Function to award XP and check level ups
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_current_level INTEGER;
BEGIN
  -- Get current level
  SELECT level INTO v_current_level FROM public.profiles WHERE user_id = p_user_id;
  
  -- Add XP
  UPDATE public.profiles 
  SET xp = xp + p_xp,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;
  
  -- Calculate new level (every 100 XP = 1 level, with increasing requirements)
  v_new_level := GREATEST(1, FLOOR(SQRT(v_new_xp / 25)) + 1);
  
  -- Update level if changed
  IF v_new_level > v_current_level THEN
    UPDATE public.profiles 
    SET level = v_new_level,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Update award_submission_points to also award XP
CREATE OR REPLACE FUNCTION public.award_submission_points(submission_id uuid, multiplier numeric DEFAULT 1.0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_quest_id UUID;
  v_base_points INTEGER;
  v_points_awarded INTEGER;
  v_xp_awarded INTEGER;
BEGIN
  -- Get submission details
  SELECT s.user_id, s.quest_id, q.base_points
  INTO v_user_id, v_quest_id, v_base_points
  FROM public.submissions s
  JOIN public.quests q ON q.id = s.quest_id
  WHERE s.id = submission_id;
  
  v_points_awarded := FLOOR(v_base_points * multiplier);
  v_xp_awarded := FLOOR(v_base_points * multiplier * 2); -- XP is 2x points
  
  -- Update submission
  UPDATE public.submissions 
  SET status = 'approved', 
      points_awarded = v_points_awarded,
      reviewed_at = now()
  WHERE id = submission_id;
  
  -- Award points to user
  UPDATE public.profiles 
  SET swap_points = swap_points + v_points_awarded,
      updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Award XP
  PERFORM public.award_xp(v_user_id, v_xp_awarded);
END;
$$;

-- Function to process referral signup
CREATE OR REPLACE FUNCTION public.process_referral(p_new_user_id UUID, p_referral_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Find the referrer
  SELECT user_id INTO v_referrer_id 
  FROM public.profiles 
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_new_user_id THEN
    -- Create referral record
    INSERT INTO public.referrals (referrer_user_id, referred_user_id, referral_code, points_awarded)
    VALUES (v_referrer_id, p_new_user_id, p_referral_code, true)
    ON CONFLICT (referred_user_id) DO NOTHING;
    
    -- Award 100 points to referrer if insert was successful
    IF FOUND THEN
      UPDATE public.profiles 
      SET swap_points = swap_points + 100,
          updated_at = now()
      WHERE user_id = v_referrer_id;
      
      -- Also award XP
      PERFORM public.award_xp(v_referrer_id, 200);
    END IF;
  END IF;
END;
$$;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);