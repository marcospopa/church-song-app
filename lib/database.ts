import { supabase } from './supabase'
import type { Song, Member, Setlist, Event } from './supabase'

// Default church ID for demo purposes
const DEFAULT_CHURCH_ID = '550e8400-e29b-41d4-a716-446655440000'

// Helper function to handle database errors with better debugging
function handleDatabaseError(error: any, operation: string) {
  console.error(`Database error in ${operation}:`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  })
  
  // Don't throw errors, return empty data instead for better UX
  return null
}

// Test database connection
export async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    
    const { data, error } = await supabase
      .from('churches')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    console.log('Connection test successful')
    return true
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}

// Songs API
export const songsApi = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('church_id', DEFAULT_CHURCH_ID)
        .order('title')
      
      if (error) {
        handleDatabaseError(error, 'fetch songs')
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in songsApi.getAll:', error)
      return []
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        handleDatabaseError(error, 'fetch song')
        return null
      }
      return data
    } catch (error) {
      console.error('Error in songsApi.getById:', error)
      return null
    }
  },

  async create(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .insert({ ...song, church_id: DEFAULT_CHURCH_ID })
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'create song')
        throw new Error(`Failed to create song: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in songsApi.create:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Song>) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'update song')
        throw new Error(`Failed to update song: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in songsApi.update:', error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id)
      
      if (error) {
        handleDatabaseError(error, 'delete song')
        throw new Error(`Failed to delete song: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in songsApi.delete:', error)
      throw error
    }
  },

  async search(query: string) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('church_id', DEFAULT_CHURCH_ID)
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .order('title')
      
      if (error) {
        handleDatabaseError(error, 'search songs')
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in songsApi.search:', error)
      return []
    }
  }
}

// Members API
export const membersApi = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('church_id', DEFAULT_CHURCH_ID)
        .order('name')
      
      if (error) {
        handleDatabaseError(error, 'fetch members')
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in membersApi.getAll:', error)
      return []
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        handleDatabaseError(error, 'fetch member')
        return null
      }
      return data
    } catch (error) {
      console.error('Error in membersApi.getById:', error)
      return null
    }
  },

  async create(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert({ ...member, church_id: DEFAULT_CHURCH_ID })
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'create member')
        throw new Error(`Failed to create member: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in membersApi.create:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Member>) {
    try {
      const { data, error } = await supabase
        .from('members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'update member')
        throw new Error(`Failed to update member: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in membersApi.update:', error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)
      
      if (error) {
        handleDatabaseError(error, 'delete member')
        throw new Error(`Failed to delete member: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in membersApi.delete:', error)
      throw error
    }
  }
}

// Setlists API
export const setlistsApi = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('setlists')
        .select(`
          *,
          setlist_songs (
            id,
            order_index,
            key_override,
            notes,
            songs (*)
          )
        `)
        .eq('church_id', DEFAULT_CHURCH_ID)
        .order('service_date', { ascending: false })
      
      if (error) {
        handleDatabaseError(error, 'fetch setlists')
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in setlistsApi.getAll:', error)
      return []
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('setlists')
        .select(`
          *,
          setlist_songs (
            id,
            order_index,
            key_override,
            notes,
            songs (*)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        handleDatabaseError(error, 'fetch setlist')
        return null
      }
      return data
    } catch (error) {
      console.error('Error in setlistsApi.getById:', error)
      return null
    }
  },

  async create(setlist: Omit<Setlist, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('setlists')
        .insert({ ...setlist, church_id: DEFAULT_CHURCH_ID })
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'create setlist')
        throw new Error(`Failed to create setlist: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in setlistsApi.create:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Setlist>) {
    try {
      const { data, error } = await supabase
        .from('setlists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'update setlist')
        throw new Error(`Failed to update setlist: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in setlistsApi.update:', error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('setlists')
        .delete()
        .eq('id', id)
      
      if (error) {
        handleDatabaseError(error, 'delete setlist')
        throw new Error(`Failed to delete setlist: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in setlistsApi.delete:', error)
      throw error
    }
  },

  async addSong(setlistId: string, songId: string, orderIndex: number, keyOverride?: string) {
    try {
      const { data, error } = await supabase
        .from('setlist_songs')
        .insert({
          setlist_id: setlistId,
          song_id: songId,
          order_index: orderIndex,
          key_override: keyOverride
        })
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'add song to setlist')
        throw new Error(`Failed to add song to setlist: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in setlistsApi.addSong:', error)
      throw error
    }
  },

  async removeSong(setlistId: string, songId: string) {
    try {
      const { error } = await supabase
        .from('setlist_songs')
        .delete()
        .eq('setlist_id', setlistId)
        .eq('song_id', songId)
      
      if (error) {
        handleDatabaseError(error, 'remove song from setlist')
        throw new Error(`Failed to remove song from setlist: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in setlistsApi.removeSong:', error)
      throw error
    }
  }
}

// Events API
export const eventsApi = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          setlists (*),
          event_participants (
            id,
            role,
            status,
            members (*)
          )
        `)
        .eq('church_id', DEFAULT_CHURCH_ID)
        .order('event_date')
      
      if (error) {
        handleDatabaseError(error, 'fetch events')
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in eventsApi.getAll:', error)
      return []
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          setlists (*),
          event_participants (
            id,
            role,
            status,
            members (*)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        handleDatabaseError(error, 'fetch event')
        return null
      }
      return data
    } catch (error) {
      console.error('Error in eventsApi.getById:', error)
      return null
    }
  },

  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, church_id: DEFAULT_CHURCH_ID })
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'create event')
        throw new Error(`Failed to create event: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in eventsApi.create:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Event>) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        handleDatabaseError(error, 'update event')
        throw new Error(`Failed to update event: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in eventsApi.update:', error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (error) {
        handleDatabaseError(error, 'delete event')
        throw new Error(`Failed to delete event: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in eventsApi.delete:', error)
      throw error
    }
  },

  async getUpcoming(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          setlists (name),
          event_participants (
            members (name)
          )
        `)
        .eq('church_id', DEFAULT_CHURCH_ID)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date')
        .limit(limit)
      
      if (error) {
        handleDatabaseError(error, 'fetch upcoming events')
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in eventsApi.getUpcoming:', error)
      return []
    }
  }
}

// Dashboard API
export const dashboardApi = {
  async getStats() {
    try {
      // Test connection first
      const connectionTest = await testConnection()
      if (!connectionTest) {
        console.warn('Database connection failed, returning default stats')
        return {
          totalSongs: 0,
          totalMembers: 0,
          totalSetlists: 0,
          upcomingEvents: 0
        }
      }

      // Use Promise.allSettled to handle individual failures gracefully
      const results = await Promise.allSettled([
        supabase.from('songs').select('id', { count: 'exact' }).eq('church_id', DEFAULT_CHURCH_ID),
        supabase.from('members').select('id', { count: 'exact' }).eq('church_id', DEFAULT_CHURCH_ID),
        supabase.from('setlists').select('id', { count: 'exact' }).eq('church_id', DEFAULT_CHURCH_ID),
        supabase.from('events').select('id', { count: 'exact' }).eq('church_id', DEFAULT_CHURCH_ID)
          .gte('event_date', new Date().toISOString().split('T')[0])
      ])

      return {
        totalSongs: results[0].status === 'fulfilled' ? (results[0].value.count || 0) : 0,
        totalMembers: results[1].status === 'fulfilled' ? (results[1].value.count || 0) : 0,
        totalSetlists: results[2].status === 'fulfilled' ? (results[2].value.count || 0) : 0,
        upcomingEvents: results[3].status === 'fulfilled' ? (results[3].value.count || 0) : 0
      }
    } catch (error) {
      console.error('Error in dashboardApi.getStats:', error)
      return {
        totalSongs: 0,
        totalMembers: 0,
        totalSetlists: 0,
        upcomingEvents: 0
      }
    }
  },

  async getRecentSongs(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('church_id', DEFAULT_CHURCH_ID)
        .not('last_used', 'is', null)
        .order('last_used', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching recent songs:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in dashboardApi.getRecentSongs:', error)
      return []
    }
  }
}
