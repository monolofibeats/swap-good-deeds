-- Fix messages RLS: Allow users to send messages to conversations they CREATED (for support flow)
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND (
    -- Either already a participant
    is_conversation_participant(auth.uid(), conversation_id)
    -- OR creator of the conversation (for initial message in support flow)
    OR EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.created_by = auth.uid()
    )
  )
);

-- Clean up duplicate conversation policies
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations v2" ON public.conversations;

-- Single clear policy for creating conversations
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (created_by = auth.uid());