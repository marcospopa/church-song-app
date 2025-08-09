-- Updated table creation script with better timestamp handling

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.setlist_songs CASCADE;
DROP TABLE IF EXISTS public.setlists CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.churches CASCADE;

-- Create tables for the worship team management system

-- Churches table
CREATE TABLE public.churches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    pastor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users/Members table
CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100),
    instruments TEXT[], -- Array of instruments
    status VARCHAR(50) DEFAULT 'active',
    join_date DATE DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Songs table
CREATE TABLE public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    key VARCHAR(10),
    tempo INTEGER,
    genre VARCHAR(100),
    duration VARCHAR(20),
    ccli_number VARCHAR(50),
    copyright TEXT,
    lyrics TEXT,
    chords TEXT,
    notes TEXT,
    tags TEXT[], -- Array of tags
    last_used DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setlists table
CREATE TABLE public.setlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service_date DATE,
    service_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setlist songs (junction table)
CREATE TABLE public.setlist_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setlist_id UUID REFERENCES public.setlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    key_override VARCHAR(10), -- Override song key for this setlist
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (services, rehearsals, etc.)
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    event_type VARCHAR(100), -- 'service', 'rehearsal', 'meeting'
    location VARCHAR(255),
    setlist_id UUID REFERENCES public.setlists(id),
    notes TEXT,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event participants (junction table)
CREATE TABLE public.event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    role VARCHAR(100), -- 'leader', 'vocalist', 'guitarist', etc.
    status VARCHAR(50) DEFAULT 'invited', -- 'invited', 'confirmed', 'declined'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_songs_church_id ON public.songs(church_id);
CREATE INDEX idx_songs_title ON public.songs(title);
CREATE INDEX idx_songs_last_used ON public.songs(last_used);
CREATE INDEX idx_setlists_church_id ON public.setlists(church_id);
CREATE INDEX idx_setlists_service_date ON public.setlists(service_date);
CREATE INDEX idx_events_church_id ON public.events(church_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_members_church_id ON public.members(church_id);

-- Enable Row Level Security
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now - can be tightened based on auth)
CREATE POLICY "Enable read access for all users" ON public.churches FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.churches FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.members FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.members FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.songs FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.setlists FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.setlists FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.setlist_songs FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.setlist_songs FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.events FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.event_participants FOR ALL USING (true);
