-- Fix: allow authenticated users (non-admin) to create conversations (support chat relies on this)
-- Ensure a PERMISSIVE INSERT policy exists.

DROP POLICY IF EXISTS "Users can create conversations v2" ON public.conversations;

CREATE POLICY "Users can create conversations v2"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());
