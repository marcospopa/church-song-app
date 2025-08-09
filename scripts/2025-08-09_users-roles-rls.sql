-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- 1) Schema changes: roles + user_roles, and members columns for auth linkage and default admin

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, role_id)
);

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS is_default_admin boolean NOT NULL DEFAULT false;

-- 2) Seed roles (idempotent)
INSERT INTO public.roles (name, description) VALUES
  ('administrator', 'Full access to all resources and settings'),
  ('coordinator', 'Manage schedules, members, setlists, and events'),
  ('worship_leader', 'Manage setlists, songs, and schedule team for services'),
  ('musician', 'View assigned events and song materials; update own profile'),
  ('viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- 3) Default admin "member" row; will be linked to auth later
INSERT INTO public.members (id, church_id, email, name, status, role, instruments, is_default_admin, join_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.churches LIMIT 1),
  'admin@worship.local',
  'Default Admin',
  'active',
  'Administrator',
  ARRAY['Vocals'],
  TRUE,
  CURRENT_DATE
)
ON CONFLICT (email) DO UPDATE
SET is_default_admin = TRUE, status = 'active';

-- Assign administrator role to default admin member
INSERT INTO public.user_roles (member_id, role_id)
SELECT m.id, r.id
FROM public.members m
JOIN public.roles r ON r.name = 'administrator'
WHERE m.email = 'admin@worship.local'
ON CONFLICT (member_id, role_id) DO NOTHING;

-- 4) DB-level protections for default admin
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

-- 5) Role helper
CREATE OR REPLACE FUNCTION public.has_role(u uuid, r_name text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.members m
    JOIN public.user_roles ur ON ur.member_id = m.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE m.auth_user_id = u
      AND r.name = r_name
  );
$$;

-- Helper: does a user "own" a member row?
CREATE OR REPLACE FUNCTION public.is_self_member(member_row_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = member_row_id
      AND m.auth_user_id = auth.uid()
  );
$$;

-- 6) RLS: enable and add policies for core tables
-- Note: This assumes authentication is required. If users are not signed in, policies will block access.

-- Members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- SELECT: admin or coordinator can read all; users can read their own row
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='members' AND policyname='members_select'
  ) THEN
    CREATE POLICY members_select ON public.members
    FOR SELECT
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR auth.uid() IS NOT NULL AND auth.uid() = auth_user_id
    );
  END IF;

  -- INSERT: admins and coordinators create members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='members' AND policyname='members_insert'
  ) THEN
    CREATE POLICY members_insert ON public.members
    FOR INSERT WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
    );
  END IF;

  -- UPDATE: admin/coordinator can edit anyone; users can edit their own row
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='members' AND policyname='members_update'
  ) THEN
    CREATE POLICY members_update ON public.members
    FOR UPDATE USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR auth.uid() IS NOT NULL AND auth.uid() = auth_user_id
    ) WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR auth.uid() IS NOT NULL AND auth.uid() = auth_user_id
    );
  END IF;

  -- DELETE: admin only (trigger blocks default admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='members' AND policyname='members_delete'
  ) THEN
    CREATE POLICY members_delete ON public.members
    FOR DELETE USING (
      public.has_role(auth.uid(),'administrator')
    );
  END IF;
END$$;

-- Roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='roles' AND policyname='roles_select_all'
  ) THEN
    CREATE POLICY roles_select_all ON public.roles FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='roles' AND policyname='roles_admin_write'
  ) THEN
    CREATE POLICY roles_admin_write ON public.roles
    FOR ALL USING (public.has_role(auth.uid(),'administrator')) WITH CHECK (public.has_role(auth.uid(),'administrator'));
  END IF;
END$$;

-- user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  -- SELECT: admins and coordinators can see all; users can see their own roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_select'
  ) THEN
    CREATE POLICY user_roles_select ON public.user_roles
    FOR SELECT
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = user_roles.member_id AND m.auth_user_id = auth.uid())
    );
  END IF;

  -- INSERT/DELETE: admin only (role assignments)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_admin_write'
  ) THEN
    CREATE POLICY user_roles_admin_write ON public.user_roles
    FOR ALL
    USING (public.has_role(auth.uid(),'administrator'))
    WITH CHECK (public.has_role(auth.uid(),'administrator'));
  END IF;
END$$;

-- Songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='songs' AND policyname='songs_select') THEN
    CREATE POLICY songs_select ON public.songs FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='songs' AND policyname='songs_write_roles') THEN
    CREATE POLICY songs_write_roles ON public.songs
    FOR ALL
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    )
    WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    );
  END IF;
END$$;

-- Setlists
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='setlists' AND policyname='setlists_select') THEN
    CREATE POLICY setlists_select ON public.setlists FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='setlists' AND policyname='setlists_write_roles') THEN
    CREATE POLICY setlists_write_roles ON public.setlists
    FOR ALL
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    )
    WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    );
  END IF;
END$$;

-- setlist_songs
ALTER TABLE public.setlist_songs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='setlist_songs' AND policyname='setlist_songs_select') THEN
    CREATE POLICY setlist_songs_select ON public.setlist_songs FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='setlist_songs' AND policyname='setlist_songs_write_roles') THEN
    CREATE POLICY setlist_songs_write_roles ON public.setlist_songs
    FOR ALL
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    )
    WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    );
  END IF;
END$$;

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='events_select') THEN
    CREATE POLICY events_select ON public.events FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='events_write_roles') THEN
    CREATE POLICY events_write_roles ON public.events
    FOR ALL
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    )
    WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    );
  END IF;
END$$;

-- event_participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_participants' AND policyname='event_participants_select') THEN
    CREATE POLICY event_participants_select ON public.event_participants FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_participants' AND policyname='event_participants_write_roles') THEN
    CREATE POLICY event_participants_write_roles ON public.event_participants
    FOR ALL
    USING (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    )
    WITH CHECK (
      public.has_role(auth.uid(),'administrator')
      OR public.has_role(auth.uid(),'coordinator')
      OR public.has_role(auth.uid(),'worship_leader')
    );
  END IF;
END$$;
