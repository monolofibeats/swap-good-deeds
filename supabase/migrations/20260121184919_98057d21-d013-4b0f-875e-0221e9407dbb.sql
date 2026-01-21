-- First create the helper function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create social_posts table for Instagram/TikTok-like posts
CREATE TABLE public.social_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  caption text,
  media_urls text[] NOT NULL DEFAULT '{}',
  wants_rewards boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published',
  points_awarded integer DEFAULT 0,
  xp_awarded integer DEFAULT 0,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Published posts are viewable by everyone" 
ON public.social_posts FOR SELECT 
USING (status = 'published' OR status = 'rewarded' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.social_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.social_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.social_posts FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any post" 
ON public.social_posts FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to award points for social posts
CREATE OR REPLACE FUNCTION public.award_social_post_points(
  p_post_id uuid,
  p_points_amount integer,
  p_xp_amount integer,
  p_admin_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can award points for social posts';
  END IF;

  -- Get the user_id from the post
  SELECT user_id INTO v_user_id FROM social_posts WHERE id = p_post_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  -- Update the post
  UPDATE social_posts SET
    status = 'rewarded',
    points_awarded = p_points_amount,
    xp_awarded = p_xp_amount,
    admin_note = p_admin_note,
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_post_id;

  -- Award points to user
  IF p_points_amount > 0 THEN
    UPDATE profiles SET swap_points = swap_points + p_points_amount WHERE user_id = v_user_id;
    
    INSERT INTO point_transactions (user_id, amount, transaction_type, description)
    VALUES (v_user_id, p_points_amount, 'earned', 'Rewarded for social post');
  END IF;

  -- Award XP to user
  IF p_xp_amount > 0 THEN
    UPDATE profiles SET xp = xp + p_xp_amount WHERE user_id = v_user_id;
  END IF;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON public.social_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();