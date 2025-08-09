import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types (updated with roles and user_roles, and new members columns)
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
        Update: Partial<Database["public"]["Tables"]["churches"]["Row"]>
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
          auth_user_id: string | null
          is_default_admin: boolean
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
          auth_user_id?: string | null
          is_default_admin?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["members"]["Row"]>
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
        Insert: Partial<Database["public"]["Tables"]["songs"]["Row"]> & { title: string; church_id: string }
        Update: Partial<Database["public"]["Tables"]["songs"]["Row"]>
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
        Insert: Partial<Database["public"]["Tables"]["setlists"]["Row"]> & { name: string; church_id: string }
        Update: Partial<Database["public"]["Tables"]["setlists"]["Row"]>
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
        Insert: Partial<Database["public"]["Tables"]["setlist_songs"]["Row"]> & {
          setlist_id: string
          song_id: string
          order_index: number
        }
        Update: Partial<Database["public"]["Tables"]["setlist_songs"]["Row"]>
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
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          church_id: string
          title: string
          event_date: string
        }
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>
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
        Insert: Partial<Database["public"]["Tables"]["event_participants"]["Row"]> & {
          event_id: string
          member_id: string
        }
        Update: Partial<Database["public"]["Tables"]["event_participants"]["Row"]>
      }
      roles: {
        Row: {
          id: string
          name: "administrator" | "coordinator" | "worship_leader" | "musician" | "viewer"
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: Database["public"]["Tables"]["roles"]["Row"]["name"]
          description?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>
      }
      user_roles: {
        Row: {
          id: string
          member_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          role_id: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>
      }
    }
  }
}

export type Song = Database["public"]["Tables"]["songs"]["Row"]
export type Member = Database["public"]["Tables"]["members"]["Row"]
export type Setlist = Database["public"]["Tables"]["setlists"]["Row"]
export type Event = Database["public"]["Tables"]["events"]["Row"]
export type RoleRow = Database["public"]["Tables"]["roles"]["Row"]
