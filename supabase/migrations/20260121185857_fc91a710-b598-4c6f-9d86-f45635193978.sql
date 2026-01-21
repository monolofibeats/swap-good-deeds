-- Add columns to social_posts for reward submission details (before/after photos, location)
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS before_photo_url text,
ADD COLUMN IF NOT EXISTS after_photo_url text,
ADD COLUMN IF NOT EXISTS location_name text,
ADD COLUMN IF NOT EXISTS location_address text,
ADD COLUMN IF NOT EXISTS lat numeric,
ADD COLUMN IF NOT EXISTS lng numeric;

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_likes
CREATE POLICY "Anyone can view likes" 
ON public.post_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can like posts" 
ON public.post_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.post_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_comments
CREATE POLICY "Anyone can view comments" 
ON public.post_comments FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can comment" 
ON public.post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
ON public.post_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.post_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updating updated_at on comments
CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();