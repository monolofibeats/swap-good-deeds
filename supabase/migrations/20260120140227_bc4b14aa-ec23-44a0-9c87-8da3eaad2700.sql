-- Create goal type enum for community events
CREATE TYPE public.event_goal_type AS ENUM ('numeric', 'submissions');

-- Create status enum for community events
CREATE TYPE public.event_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Community events table
CREATE TABLE public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cause text NOT NULL,
  description text,
  goal_type public.event_goal_type NOT NULL,
  goal_target numeric NOT NULL,
  goal_current numeric NOT NULL DEFAULT 0,
  goal_unit text NOT NULL, -- e.g., 'items', 'dollars', 'submissions'
  measurement_description text NOT NULL, -- How progress is measured
  photo_url text,
  status public.event_status NOT NULL DEFAULT 'draft',
  starts_at timestamp with time zone,
  ends_at timestamp with time zone, -- Optional end date
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Community event contributions (for monetary/supply donations)
CREATE TABLE public.event_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Community event submissions (for quest-like photo submissions)
CREATE TABLE public.event_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  photo_url text NOT NULL,
  description text,
  contribution_value numeric DEFAULT 1, -- Each submission counts as 1 by default
  status public.submission_status NOT NULL DEFAULT 'pending',
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_submissions ENABLE ROW LEVEL SECURITY;

-- Community events policies
CREATE POLICY "Anyone can view active events"
  ON public.community_events FOR SELECT
  USING (status = 'active' OR status = 'completed' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create events"
  ON public.community_events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
  ON public.community_events FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Event contributions policies
CREATE POLICY "Users can view all contributions"
  ON public.event_contributions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can contribute"
  ON public.event_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Event submissions policies
CREATE POLICY "Users can view approved submissions or their own"
  ON public.event_submissions FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can submit"
  ON public.event_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update submissions"
  ON public.event_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Function to update event progress when contribution is added
CREATE OR REPLACE FUNCTION public.update_event_progress_on_contribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_events
  SET goal_current = goal_current + NEW.amount,
      updated_at = now()
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

-- Function to update event progress when submission is approved
CREATE OR REPLACE FUNCTION public.update_event_progress_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.community_events
    SET goal_current = goal_current + COALESCE(NEW.contribution_value, 1),
        updated_at = now()
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for contributions
CREATE TRIGGER trg_update_event_on_contribution
  AFTER INSERT ON public.event_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_progress_on_contribution();

-- Trigger for approved submissions
CREATE TRIGGER trg_update_event_on_submission
  AFTER INSERT OR UPDATE ON public.event_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_progress_on_submission();

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_events;