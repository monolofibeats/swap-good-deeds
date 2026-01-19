-- Create a table to track points/XP transactions (history)
CREATE TABLE public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('quest_reward', 'listing_reward', 'referral', 'purchase', 'redemption', 'admin_adjustment', 'streak_bonus', 'level_bonus')),
  description TEXT,
  related_id UUID, -- Reference to submission, listing, redemption, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own point transactions"
ON public.points_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Only system/admin can insert (via functions)
CREATE POLICY "Admins can insert point transactions"
ON public.points_transactions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create level_tiers table for level-based perks
CREATE TABLE public.level_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_level INTEGER NOT NULL,
  max_level INTEGER NOT NULL,
  tier_name TEXT NOT NULL,
  tier_color TEXT NOT NULL DEFAULT '#888888',
  daily_listing_limit INTEGER NOT NULL DEFAULT 3,
  point_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  has_themes BOOLEAN NOT NULL DEFAULT false,
  streak_bonus_eligible BOOLEAN NOT NULL DEFAULT false,
  free_code_monthly BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default level tiers
INSERT INTO public.level_tiers (min_level, max_level, tier_name, tier_color, daily_listing_limit, point_multiplier, has_themes, streak_bonus_eligible, free_code_monthly) VALUES
(1, 4, 'Starter', '#9CA3AF', 3, 1.00, false, false, false),
(5, 9, 'Contributor', '#10B981', 5, 1.10, true, false, false),
(10, 14, 'Supporter', '#3B82F6', 7, 1.20, true, true, false),
(15, 24, 'Champion', '#8B5CF6', 10, 1.35, true, true, true),
(25, 99, 'Legend', '#F59E0B', 999, 1.50, true, true, true);

-- RLS for level_tiers (public read)
ALTER TABLE public.level_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Level tiers are viewable by everyone"
ON public.level_tiers FOR SELECT USING (true);

-- Chat conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('dm', 'group', 'listing')),
  title TEXT, -- For group chats
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation creators can update"
ON public.conversations FOR UPDATE
USING (created_by = auth.uid());

-- RLS Policies for participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Conversation creators can add participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.created_by = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can update own participation"
ON public.conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit own messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid());

-- Add admin_note column to submissions for review feedback
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Create a new function to award points with custom amount (replacing multiplier)
CREATE OR REPLACE FUNCTION public.award_submission_points_v2(
  p_submission_id UUID,
  p_points_amount INTEGER,
  p_xp_amount INTEGER,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_quest_title TEXT;
BEGIN
  -- Get the user_id and quest info from submission
  SELECT s.user_id, q.title INTO v_user_id, v_quest_title
  FROM submissions s
  JOIN quests q ON q.id = s.quest_id
  WHERE s.id = p_submission_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Update the submission
  UPDATE submissions
  SET status = 'approved',
      reviewed_at = now(),
      points_awarded = p_points_amount,
      admin_note = p_admin_note
  WHERE id = p_submission_id;

  -- Award swap points
  UPDATE profiles
  SET swap_points = swap_points + p_points_amount
  WHERE user_id = v_user_id;

  -- Award XP
  PERFORM award_xp(v_user_id, p_xp_amount);

  -- Log the transaction
  INSERT INTO points_transactions (user_id, amount, transaction_type, description, related_id)
  VALUES (v_user_id, p_points_amount, 'quest_reward', 'Quest: ' || v_quest_title, p_submission_id);
END;
$$;

-- Create function to award listing completion points
CREATE OR REPLACE FUNCTION public.award_listing_points(
  p_listing_id UUID,
  p_user_id UUID,
  p_points_amount INTEGER,
  p_xp_amount INTEGER,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing_title TEXT;
BEGIN
  SELECT title INTO v_listing_title FROM listings WHERE id = p_listing_id;

  -- Award swap points
  UPDATE profiles
  SET swap_points = swap_points + p_points_amount
  WHERE user_id = p_user_id;

  -- Award XP
  PERFORM award_xp(p_user_id, p_xp_amount);

  -- Log the transaction
  INSERT INTO points_transactions (user_id, amount, transaction_type, description, related_id)
  VALUES (p_user_id, p_points_amount, 'listing_reward', 'Listing: ' || v_listing_title, p_listing_id);
END;
$$;

-- Update redeem_reward to log transaction
CREATE OR REPLACE FUNCTION public.redeem_reward(p_user_id UUID, p_reward_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
  v_current_points INTEGER;
  v_code TEXT;
  v_reward_title TEXT;
BEGIN
  -- Get reward cost and title
  SELECT cost_points, title INTO v_cost, v_reward_title 
  FROM rewards WHERE id = p_reward_id AND is_active = true;
  
  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  -- Get current points
  SELECT swap_points INTO v_current_points FROM profiles WHERE user_id = p_user_id;
  
  IF v_current_points < v_cost THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Generate code
  v_code := generate_redemption_code();

  -- Deduct points
  UPDATE profiles SET swap_points = swap_points - v_cost WHERE user_id = p_user_id;

  -- Create redemption
  INSERT INTO redemptions (user_id, reward_id, points_spent, code)
  VALUES (p_user_id, p_reward_id, v_cost, v_code);

  -- Log the transaction (negative amount for spending)
  INSERT INTO points_transactions (user_id, amount, transaction_type, description, related_id)
  VALUES (p_user_id, -v_cost, 'redemption', 'Redeemed: ' || v_reward_title, p_reward_id);

  RETURN v_code;
END;
$$;

-- Create point_purchases table for Stripe purchases
CREATE TABLE public.point_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  package_name TEXT NOT NULL,
  points_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.point_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
ON public.point_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
ON public.point_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update purchase status
CREATE POLICY "Admins can update purchases"
ON public.point_purchases FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));