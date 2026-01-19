-- 1. Add 'service_offer' to listing_type enum (for skill-based help offers)
ALTER TYPE public.listing_type ADD VALUE IF NOT EXISTS 'service_offer';

-- 2. Add promotion columns to listings and quests tables
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.quests 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMP WITH TIME ZONE;

-- 3. Create a promotion_purchases table to track all promotions (money and points)
CREATE TABLE IF NOT EXISTS public.promotion_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'quest')),
  item_id UUID NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('money', 'points')),
  points_spent INTEGER,
  price_cents INTEGER,
  stripe_session_id TEXT,
  duration_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled'))
);

-- Enable RLS on promotion_purchases
ALTER TABLE public.promotion_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotion_purchases
CREATE POLICY "Users can create their own promotions"
ON public.promotion_purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own promotions"
ON public.promotion_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update promotions"
ON public.promotion_purchases
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
