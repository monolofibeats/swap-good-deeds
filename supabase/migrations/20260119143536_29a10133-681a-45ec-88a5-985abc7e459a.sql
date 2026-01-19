-- Security fix: remove overly-permissive notifications INSERT policy (WITH CHECK true)
-- This prevents any authenticated user from creating notifications for other users.

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
