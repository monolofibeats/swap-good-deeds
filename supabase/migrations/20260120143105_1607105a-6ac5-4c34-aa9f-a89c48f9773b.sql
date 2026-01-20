-- Allow admins to delete community events
CREATE POLICY "Admins can delete events"
ON public.community_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete event submissions (for cleanup when deleting events)
CREATE POLICY "Admins can delete event submissions"
ON public.event_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete event contributions (for cleanup when deleting events)
CREATE POLICY "Admins can delete contributions"
ON public.event_contributions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));