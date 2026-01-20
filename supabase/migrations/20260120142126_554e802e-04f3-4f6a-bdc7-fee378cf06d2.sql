-- Update event_submissions to support multiple photos
ALTER TABLE public.event_submissions 
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- Migrate existing photo_url to photo_urls array
UPDATE public.event_submissions 
SET photo_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL AND (photo_urls IS NULL OR photo_urls = '{}');

-- Drop the trigger that auto-updates on contribution (contributions should be reviewed first)
DROP TRIGGER IF EXISTS on_event_contribution ON public.event_contributions;

-- Add status column to event_contributions for admin review
ALTER TABLE public.event_contributions 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add reviewed_by and reviewed_at columns to event_contributions
ALTER TABLE public.event_contributions 
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

-- Add approved_amount to event_contributions (what admin decides counts toward goal)
ALTER TABLE public.event_contributions 
ADD COLUMN IF NOT EXISTS approved_amount numeric DEFAULT 0;

-- Update the trigger function to only count approved contributions
CREATE OR REPLACE FUNCTION public.update_event_progress_on_contribution()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if the contribution is being approved
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.community_events
    SET goal_current = goal_current + COALESCE(NEW.approved_amount, NEW.amount),
        updated_at = now()
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger for contributions (on UPDATE only, when approved)
CREATE TRIGGER on_event_contribution_approved
AFTER UPDATE ON public.event_contributions
FOR EACH ROW
EXECUTE FUNCTION update_event_progress_on_contribution();

-- Add RLS policy for admins to update contributions
DROP POLICY IF EXISTS "Admins can update contributions" ON public.event_contributions;
CREATE POLICY "Admins can update contributions"
ON public.event_contributions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add contribution_method to community_events (how users can contribute)
ALTER TABLE public.community_events
ADD COLUMN IF NOT EXISTS contribution_method text NOT NULL DEFAULT 'photos';
-- Options: 'single_photo', 'multiple_photos', 'numeric', 'both'