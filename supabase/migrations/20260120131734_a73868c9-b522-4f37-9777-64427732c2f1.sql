-- Make supporter status persistent and reliably granted upon approval

-- 1) Backfill: any approved supporter application => profile becomes supporter
UPDATE public.profiles p
SET user_type = 'supporter'
FROM (
  SELECT DISTINCT user_id
  FROM public.supporter_applications
  WHERE status = 'approved'
) a
WHERE p.user_id = a.user_id
  AND (p.user_type IS DISTINCT FROM 'supporter');

-- 2) When a supporter application is approved, automatically set the user's profile type to supporter
CREATE OR REPLACE FUNCTION public.sync_supporter_approval_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
      UPDATE public.profiles
      SET user_type = 'supporter'
      WHERE user_id = NEW.user_id;
    END IF;
  ELSIF (TG_OP = 'INSERT') THEN
    IF NEW.status = 'approved' THEN
      UPDATE public.profiles
      SET user_type = 'supporter'
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_supporter_approval_to_profile ON public.supporter_applications;
CREATE TRIGGER trg_sync_supporter_approval_to_profile
AFTER INSERT OR UPDATE OF status ON public.supporter_applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_supporter_approval_to_profile();

-- 3) Prevent supporters from downgrading themselves back to helper (supporter is permanent)
CREATE OR REPLACE FUNCTION public.prevent_supporter_downgrade()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.user_type = 'supporter' AND NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    IF NEW.user_type IS DISTINCT FROM 'supporter' THEN
      RAISE EXCEPTION 'Supporter role is permanent and cannot be removed.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_supporter_downgrade ON public.profiles;
CREATE TRIGGER trg_prevent_supporter_downgrade
BEFORE UPDATE OF user_type ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_supporter_downgrade();
