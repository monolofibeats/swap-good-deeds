-- Fix conversation_type check constraint to include 'support'
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_conversation_type_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_conversation_type_check 
  CHECK (conversation_type = ANY (ARRAY['dm', 'group', 'listing', 'support']));

-- Add table for saved searches
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches" 
  ON public.saved_searches FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches" 
  ON public.saved_searches FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" 
  ON public.saved_searches FOR DELETE 
  USING (auth.uid() = user_id);

-- Add table for notifications  
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'quest', 'listing', 'saved_search', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;