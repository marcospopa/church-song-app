import { createClient } from '@supabase/supabase-js'

// Check if environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          pastor_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          pastor_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          pastor_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          church_id: string
          email: string
          name: string
          phone: string | null
          role: string | null
          instruments: string[] | null
          status: string
          join_date: string
          avatar_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          email: string
          name: string
          phone?: string | null
          role?: string | null
          instruments?: string[] | null
          status?: string
          join_date?: string
          avatar_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: string | null
          instruments?: string[] | null
          status?: string
          join_date?: string
          avatar_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          church_id: string
          title: string
          artist: string | null
          key: string | null
          tempo: number | null
          genre: string | null
          duration: string | null
          ccli_number: string | null
          copyright: string | null
          lyrics: string | null
          chords: string | null
          notes: string | null
          tags: string[] | null
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          title: string
          artist?: string | null
          key?: string | null
          tempo?: number | null
          genre?: string | null
          duration?: string | null
          ccli_number?: string | null
          copyright?: string | null
          lyrics?: string | null
          chords?: string | null
          notes?: string | null
          tags?: string[] | null
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          title?: string
          artist?: string | null
          key?: string | null
          tempo?: number | null
          genre?: string | null
          duration?: string | null
          ccli_number?: string | null
          copyright?: string | null
          lyrics?: string | null
          chords?: string | null
          notes?: string | null
          tags?: string[] | null
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      setlists: {
        Row: {
          id: string
          church_id: string
          name: string
          service_date: string | null
          service_type: string | null
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          name: string
          service_date?: string | null
          service_type?: string | null
          status?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          name?: string
          service_date?: string | null
          service_type?: string | null
          status?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      setlist_songs: {
        Row: {
          id: string
          setlist_id: string
          song_id: string
          order_index: number
          key_override: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          setlist_id: string
          song_id: string
          order_index: number
          key_override?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          setlist_id?: string
          song_id?: string
          order_index?: number
          key_override?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          church_id: string
          title: string
          event_date: string
          event_time: string | null
          event_type: string | null
          location: string | null
          setlist_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          title: string
          event_date: string
          event_time?: string | null
          event_type?: string | null
          location?: string | null
          setlist_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          title?: string
          event_date?: string
          event_time?: string | null
          event_type?: string | null
          location?: string | null
          setlist_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          member_id: string
          role: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          member_id: string
          role?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          member_id?: string
          role?: string | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}

export type Song = Database['public']['Tables']['songs']['Row']
export type Member = Database['public']['Tables']['members']['Row']
export type Setlist = Database['public']['Tables']['setlists']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Church = Database['public']['Tables']['churches']['Row']
