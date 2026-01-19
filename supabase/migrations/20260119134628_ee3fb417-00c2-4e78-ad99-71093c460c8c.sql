-- First, create a security definer function to check conversation participation
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE user_id = _user_id
      AND conversation_id = _conversation_id
  )
$$;

-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  public.is_conversation_participant(auth.uid(), conversation_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT
USING (
  public.is_conversation_participant(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  public.is_conversation_participant(auth.uid(), conversation_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND public.is_conversation_participant(auth.uid(), conversation_id)
);

-- Create supporter_applications table for role approval process
CREATE TABLE public.supporter_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  yearly_revenue TEXT,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  what_they_offer TEXT NOT NULL,
  about_them TEXT NOT NULL,
  why_supporter TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.supporter_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own applications"
ON public.supporter_applications FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create applications"
ON public.supporter_applications FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update applications"
ON public.supporter_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));