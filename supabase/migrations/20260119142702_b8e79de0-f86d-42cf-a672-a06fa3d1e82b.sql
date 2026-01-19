-- Add 'needs_more_info' status to supporter_applications
ALTER TABLE public.supporter_applications DROP CONSTRAINT IF EXISTS supporter_applications_status_check;
ALTER TABLE public.supporter_applications ADD CONSTRAINT supporter_applications_status_check 
  CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'needs_more_info']));

-- Fix conversation_participants INSERT policy to allow adding self to any conversation where user is creator
-- The issue: current policy requires being the creator OR user_id = auth.uid(), but second participant insert fails
DROP POLICY IF EXISTS "Conversation creators can add participants" ON public.conversation_participants;

CREATE POLICY "Users can add participants to their conversations"
ON public.conversation_participants FOR INSERT
WITH CHECK (
  -- Creator can add anyone
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND c.created_by = auth.uid()
  )
  OR 
  -- User can add themselves to a conversation (for edge function with service role, this isn't needed but good for safety)
  user_id = auth.uid()
);