-- Roles & Users schema + protections and seeds

-- Ensure pgcrypto for UUIDs (usually enabled). Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles mapping to members (app users)
-- We link roles to members; members.auth_user_id maps to auth.users.id when available.
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS is_default_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (member_id, role_id)
);

-- Seed roles (idempotent)
INSERT INTO public.roles (name, description)
VALUES
  ('administrator', 'Full access to all resources and settings'),
  ('coordinator', 'Manage schedules, members, and setlists'),
  ('worship_leader', 'Manage setlists and songs; schedule team for services'),
  ('musician', 'View assigned events, view songs/materials, update own profile'),
  ('viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- Create default church if not exists (used for default admin)
INSERT INTO public.churches (id, name)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Default Church')
ON CONFLICT (id) DO NOTHING;

-- Create a default admin member row (to be linked later to auth_user_id by script)
-- We use a stable UUID for clarity.
INSERT INTO public.members (
  id, church_id, email, name, status, role, instruments, is_default_admin
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@worship.local',
  'Default Admin',
  'active',
  'Administrator',
  ARRAY['Vocals'],
  TRUE
) ON CONFLICT (email) DO UPDATE
SET is_default_admin = TRUE,
    status = 'active';

-- Assign administrator role to the default admin member (idempotent)
INSERT INTO public.user_roles (member_id, role_id)
SELECT m.id, r.id
FROM public.members m
JOIN public.roles r ON r.name = 'administrator'
WHERE m.email = 'admin@worship.local'
ON CONFLICT (member_id, role_id) DO NOTHING;

-- Protect default admin from deletion at DB level
CREATE OR REPLACE FUNCTION public.prevent_default_admin_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.is_default_admin THEN
    RAISE EXCEPTION 'Default admin user cannot be deleted.';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_default_admin_delete ON public.members;
CREATE TRIGGER trg_prevent_default_admin_delete
BEFORE DELETE ON public.members
FOR EACH ROW
EXECUTE PROCEDURE public.prevent_default_admin_delete();

-- Optional: Prevent unflagging default admin (cannot change is_default_admin from true to false)
CREATE OR REPLACE FUNCTION public.prevent_unflag_default_admin()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.is_default_admin = TRUE AND NEW.is_default_admin = FALSE THEN
    RAISE EXCEPTION 'Default admin flag cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_unflag_default_admin ON public.members;
CREATE TRIGGER trg_prevent_unflag_default_admin
BEFORE UPDATE ON public.members
FOR EACH ROW
WHEN (OLD.is_default_admin = TRUE)
EXECUTE PROCEDURE public.prevent_unflag_default_admin();

-- RLS for new tables (permissive to avoid breaking current app flows)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='roles' AND policyname='roles_select_all'
  ) THEN
    CREATE POLICY roles_select_all ON public.roles FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='roles' AND policyname='roles_all_all'
  ) THEN
    CREATE POLICY roles_all_all ON public.roles FOR ALL USING (TRUE) WITH CHECK (TRUE);
  END IF;

  -- user_roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_select_all'
  ) THEN
    CREATE POLICY user_roles_select_all ON public.user_roles FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_all_all'
  ) THEN
    CREATE POLICY user_roles_all_all ON public.user_roles FOR ALL USING (TRUE) WITH CHECK (TRUE);
  END IF;
END$$;
