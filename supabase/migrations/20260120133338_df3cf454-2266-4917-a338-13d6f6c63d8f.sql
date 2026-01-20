-- Fix Issue #1: Add admin authorization checks to SECURITY DEFINER functions
-- These functions can be called by any authenticated user without auth checks - critical security hole

-- Update award_listing_points to require admin role
CREATE OR REPLACE FUNCTION public.award_listing_points(
  p_listing_id uuid,
  p_user_id uuid,
  p_points_amount integer,
  p_xp_amount integer,
  p_admin_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL: Verify caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Award points
  UPDATE public.profiles
  SET swap_points = swap_points + p_points_amount
  WHERE user_id = p_user_id;

  -- Award XP
  PERFORM public.award_xp(p_user_id, p_xp_amount);

  -- Log transaction
  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description, related_id)
  VALUES (p_user_id, p_points_amount, 'listing_reward', COALESCE(p_admin_note, 'Points awarded for listing'), p_listing_id);
END;
$$;

-- Update award_submission_points_v2 to require admin role
CREATE OR REPLACE FUNCTION public.award_submission_points_v2(
  p_submission_id uuid,
  p_points_amount integer,
  p_xp_amount integer,
  p_admin_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_quest_id uuid;
BEGIN
  -- CRITICAL: Verify caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Get submission info
  SELECT user_id, quest_id INTO v_user_id, v_quest_id
  FROM public.submissions
  WHERE id = p_submission_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Award points
  UPDATE public.profiles
  SET swap_points = swap_points + p_points_amount
  WHERE user_id = v_user_id;

  -- Award XP
  PERFORM public.award_xp(v_user_id, p_xp_amount);

  -- Update submission with points awarded
  UPDATE public.submissions
  SET points_awarded = p_points_amount,
      admin_note = p_admin_note
  WHERE id = p_submission_id;

  -- Log transaction
  INSERT INTO public.points_transactions (user_id, amount, transaction_type, description, related_id)
  VALUES (v_user_id, p_points_amount, 'quest_reward', COALESCE(p_admin_note, 'Points awarded for quest submission'), v_quest_id);
END;
$$;