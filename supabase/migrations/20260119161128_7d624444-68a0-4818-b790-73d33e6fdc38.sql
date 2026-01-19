-- Fix support chat creation: allow conversation creators to SELECT their conversation (needed for INSERT ... RETURNING)

DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;

CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  public.is_conversation_participant(auth.uid(), id)
  OR created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);
