-- Migration: Add is_staff boolean to public.users for fast portal-level gating
-- This column allows the login layer to reject cross-portal attempts
-- without a role string comparison in every middleware check.

-- 1. Add is_staff column (non-breaking — defaults false for all existing rows)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT false;

-- 2. Back-fill all existing staff/admin rows
UPDATE public.users
  SET is_staff = true
  WHERE role IN ('admin', 'reception', 'kitchen');

-- 3. Keep is_staff in sync automatically going forward
CREATE OR REPLACE FUNCTION public.sync_is_staff()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.is_staff := (NEW.role IN ('admin', 'reception', 'kitchen'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_is_staff ON public.users;
CREATE TRIGGER trg_sync_is_staff
  BEFORE INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_is_staff();
