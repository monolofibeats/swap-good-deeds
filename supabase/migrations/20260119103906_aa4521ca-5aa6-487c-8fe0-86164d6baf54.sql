-- ============================================
-- SWAP Platform Database Schema
-- ============================================

-- 1. Create role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create listing type enum
CREATE TYPE public.listing_type AS ENUM ('help_request', 'micro_job', 'good_deed_request');

-- 3. Create quest type enum
CREATE TYPE public.quest_type AS ENUM ('cleanup', 'good_deed');

-- 4. Create status enums
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.redemption_status AS ENUM ('issued', 'redeemed', 'expired');
CREATE TYPE public.reward_category AS ENUM ('food', 'shower', 'bed', 'discount', 'other');

-- ============================================
-- USER ROLES TABLE (Security Best Practice)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles: users can view their own roles, admins can view all
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT NOT NULL DEFAULT 'SWAP User',
    swap_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'SWAP User'));
  
  -- Also create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- QUESTS TABLE
-- ============================================
CREATE TABLE public.quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quest_type quest_type NOT NULL,
    base_points INTEGER NOT NULL DEFAULT 100,
    location_name TEXT NOT NULL,
    location_address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    impressions INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests are viewable by everyone"
ON public.quests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert quests"
ON public.quests FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quests"
ON public.quests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    location_name TEXT,
    location_address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status submission_status NOT NULL DEFAULT 'pending',
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create submissions"
ON public.submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update submissions"
ON public.submissions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    listing_type listing_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',
    location_name TEXT NOT NULL,
    location_address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status listing_status NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    impressions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved listings, admins can view all
CREATE POLICY "View approved listings or admin view all"
ON public.listings FOR SELECT
TO authenticated
USING (status = 'approved' OR creator_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create listings"
ON public.listings FOR INSERT
TO authenticated
WITH CHECK (creator_user_id = auth.uid());

CREATE POLICY "Admins can update listings"
ON public.listings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- LISTING APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.listing_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    applicant_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.listing_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications or admins/creators"
ON public.listing_applications FOR SELECT
TO authenticated
USING (
  applicant_user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND creator_user_id = auth.uid())
);

CREATE POLICY "Users can create applications"
ON public.listing_applications FOR INSERT
TO authenticated
WITH CHECK (applicant_user_id = auth.uid());

CREATE POLICY "Admins or creators can update applications"
ON public.listing_applications FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND creator_user_id = auth.uid())
);

-- ============================================
-- REWARDS TABLE
-- ============================================
CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cost_points INTEGER NOT NULL,
    category reward_category NOT NULL DEFAULT 'other',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards are viewable by everyone"
ON public.rewards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage rewards"
ON public.rewards FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- REDEMPTIONS TABLE
-- ============================================
CREATE TABLE public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE NOT NULL,
    points_spent INTEGER NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status redemption_status NOT NULL DEFAULT 'issued',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    redeemed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
ON public.redemptions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create redemptions"
ON public.redemptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update redemptions"
ON public.redemptions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true);

-- Storage policies for submissions bucket
CREATE POLICY "Anyone can view submission images"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions');

CREATE POLICY "Authenticated users can upload submission images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions');

-- Storage policies for listings bucket
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment quest impressions
CREATE OR REPLACE FUNCTION public.increment_quest_impressions(quest_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quests SET impressions = impressions + 1 WHERE id = quest_id;
END;
$$;

-- Function to increment listing impressions
CREATE OR REPLACE FUNCTION public.increment_listing_impressions(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.listings SET impressions = impressions + 1 WHERE id = listing_id;
END;
$$;

-- Function to generate unique redemption code
CREATE OR REPLACE FUNCTION public.generate_redemption_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN 'SWAP-' || result;
END;
$$;

-- Function to update user points (for admin approval)
CREATE OR REPLACE FUNCTION public.award_submission_points(
  submission_id UUID,
  multiplier DECIMAL DEFAULT 1.0
)
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
BEGIN
  -- Get submission details
  SELECT s.user_id, s.quest_id, q.base_points
  INTO v_user_id, v_quest_id, v_base_points
  FROM public.submissions s
  JOIN public.quests q ON q.id = s.quest_id
  WHERE s.id = submission_id;
  
  v_points_awarded := FLOOR(v_base_points * multiplier);
  
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
END;
$$;

-- Function to redeem reward
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id UUID,
  p_reward_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
  v_current_points INTEGER;
  v_code TEXT;
BEGIN
  -- Get reward cost
  SELECT cost_points INTO v_cost FROM public.rewards WHERE id = p_reward_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;
  
  -- Get user's current points
  SELECT swap_points INTO v_current_points FROM public.profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Check if user has enough points
  IF v_current_points < v_cost THEN
    RAISE EXCEPTION 'Not enough SWAP Points';
  END IF;
  
  -- Generate unique code
  v_code := public.generate_redemption_code();
  
  -- Deduct points
  UPDATE public.profiles 
  SET swap_points = swap_points - v_cost,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create redemption
  INSERT INTO public.redemptions (user_id, reward_id, points_spent, code)
  VALUES (p_user_id, p_reward_id, v_cost, v_code);
  
  RETURN v_code;
END;
$$;

-- ============================================
-- SEED DATA
-- ============================================

-- Seed Quests (5 quests)
INSERT INTO public.quests (title, description, quest_type, base_points, location_name, location_address, lat, lng)
VALUES 
  ('Beach Cleanup Challenge', 'Help clean up plastic and debris from our local beach. Every piece of trash collected makes a difference!', 'cleanup', 150, 'Sunset Beach', '123 Coastal Drive, Beach City, CA 90210', 34.0195, -118.4912),
  ('Park Restoration Project', 'Join our community park cleanup. Remove litter, pull weeds, and help restore our green spaces.', 'cleanup', 120, 'Central Community Park', '456 Park Avenue, Green Valley, CA 90211', 34.0522, -118.2437),
  ('Elderly Neighbor Assistance', 'Help an elderly neighbor with grocery shopping or yard work. Spread kindness in your community!', 'good_deed', 100, 'Oakwood Senior Center', '789 Oak Street, Friendly Town, CA 90212', 34.0736, -118.4004),
  ('River Trail Cleanup', 'Clear trash and debris along our beautiful river trail. Protect local wildlife habitats!', 'cleanup', 175, 'Riverside Nature Trail', '321 River Road, Natureville, CA 90213', 34.1478, -118.1445),
  ('Community Garden Help', 'Assist at the community garden - planting, weeding, or helping distribute fresh produce to those in need.', 'good_deed', 80, 'Harvest Community Garden', '555 Garden Lane, Green Thumb, CA 90214', 34.0259, -118.3997);

-- Seed Rewards (5 rewards)
INSERT INTO public.rewards (partner_name, title, description, cost_points, category)
VALUES
  ('Green Bean Cafe', 'Free Coffee & Pastry', 'Enjoy a free medium coffee and your choice of pastry at Green Bean Cafe.', 100, 'food'),
  ('City Rec Center', 'Free Shower Pass', 'One free shower access at any City Recreation Center location.', 50, 'shower'),
  ('Cozy Corner Hostel', 'One Night Stay', 'A free one-night stay at Cozy Corner Hostel. Subject to availability.', 500, 'bed'),
  ('Local Bike Shop', '20% Off Any Repair', 'Get 20% off any bicycle repair service at Local Bike Shop.', 75, 'discount'),
  ('Fresh Market', '$10 Grocery Credit', 'Redeem for $10 credit on fresh produce at Fresh Market.', 200, 'food');