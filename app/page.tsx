"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Music, Users, FileText, Clock, TrendingUp, AlertCircle, Database, Wifi, WifiOff } from 'lucide-react'
import Link from "next/link"
import { dashboardApi, eventsApi, testConnection } from "@/lib/database"
import type { Song, Event } from "@/lib/supabase"

interface DashboardStats {
  totalSongs: number
  totalMembers: number
  totalSetlists: number
  upcomingEvents: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSongs: 0,
    totalMembers: 0,
    totalSetlists: 0,
    upcomingEvents: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setError(null)
        setConnectionStatus('checking')
        
        // Check if environment variables are set
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError('env_missing')
          setConnectionStatus('disconnected')
          setLoading(false)
          return
        }
        
        // Test database connection
        const isConnected = await testConnection()
        if (!isConnected) {
          setError('connection_failed')
          setConnectionStatus('disconnected')
          setLoading(false)
          return
        }
        
        setConnectionStatus('connected')
        
        // Load data with individual error handling
        const [statsData, eventsData, songsData] = await Promise.allSettled([
          dashboardApi.getStats(),
          eventsApi.getUpcoming(),
          dashboardApi.getRecentSongs()
        ])

        // Handle stats
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value)
        } else {
          console.error('Failed to load stats:', statsData.reason)
        }

        // Handle events
        if (eventsData.status === 'fulfilled') {
          setUpcomingEvents(eventsData.value || [])
        } else {
          console.error('Failed to load events:', eventsData.reason)
        }

        // Handle songs
        if (songsData.status === 'fulfilled') {
          setRecentSongs(songsData.value || [])
        } else {
          console.error('Failed to load recent songs:', songsData.reason)
        }

      } catch (error: any) {
        console.error('Error loading dashboard data:', error)
        if (error.message?.includes('Missing Supabase environment variables')) {
          setError('env_missing')
        } else {
          setError('database_setup')
        }
        setConnectionStatus('disconnected')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statsCards = [
    { label: "Total Songs", value: stats.totalSongs.toString(), icon: Music },
    { label: "Team Members", value: stats.totalMembers.toString(), icon: Users },
    { label: "Upcoming Events", value: stats.upcomingEvents.toString(), icon: Calendar },
    { label: "Total Setlists", value: stats.totalSetlists.toString(), icon: FileText }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Worship Team Dashboard</h1>
          <p className="text-muted-foreground">Loading your worship team data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error === 'env_missing') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Worship Team Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your worship team management system</p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Environment Variables Missing
            </CardTitle>
            <CardDescription className="text-red-700">
              Your Supabase credentials are not configured. Please set up your environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-4">To connect to your Supabase database:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Create a <code className="bg-red-100 px-2 py-1 rounded">.env.local</code> file in your project root</li>
              <li>Add your Supabase credentials:
                <pre className="bg-red-100 p-3 rounded mt-2 text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </li>
              <li>Get your credentials from your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a> → Settings → API</li>
              <li>Restart your development server</li>
            </ol>
            <p className="text-sm">Need help? Check the Supabase documentation for setting up a new project.</p>
          </CardContent>
        </Card>

        {/* Show quick actions even without database */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Once your database is connected, you can use these features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button disabled>Add New Song</Button>
              <Button variant="outline" disabled>Create Setlist</Button>
              <Button variant="outline" disabled>Add Team Member</Button>
              <Button variant="outline" disabled>Export Tools</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error === 'connection_failed') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Worship Team Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your worship team management system</p>
        </div>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <WifiOff className="h-5 w-5" />
              Connection Failed
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Unable to connect to your Supabase database. Please check your configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <p className="mb-4">Possible issues:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Invalid Supabase URL or API key</li>
              <li>Network connectivity issues</li>
              <li>Supabase project is paused or deleted</li>
              <li>Row Level Security policies blocking access</li>
            </ul>
            <p className="mb-4">To troubleshoot:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Verify your credentials in <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code></li>
              <li>Check your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Ensure your project is active and not paused</li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </CardContent>
        </Card>

        {/* Show quick actions even without database */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Once your database is connected, you can use these features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button disabled>Add New Song</Button>
              <Button variant="outline" disabled>Create Setlist</Button>
              <Button variant="outline" disabled>Add Team Member</Button>
              <Button variant="outline" disabled>Export Tools</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error === 'database_setup') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Worship Team Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your worship team management system</p>
        </div>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Database className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              Your Supabase connection is working, but the database tables need to be created.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-orange-700">
            <p className="mb-4">To set up your database:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Navigate to SQL Editor</li>
              <li>Run the <code className="bg-orange-100 px-2 py-1 rounded">create-tables.sql</code> script</li>
              <li>Run the <code className="bg-orange-100 px-2 py-1 rounded">seed-data.sql</code> script</li>
              <li>Refresh this page</li>
            </ol>
            <p>Once the database is set up, you'll see your worship team data here.</p>
          </CardContent>
        </Card>

        {/* Show quick actions even without database */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your worship team management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild>
                <Link href="/songs/new">Add New Song</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/setlists/new">Create Setlist</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/members/new">Add Team Member</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/export">Export Tools</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Worship Team Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your worship team.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {connectionStatus === 'connected' ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span>Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Services
            </CardTitle>
            <CardDescription>Your next scheduled worship services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.event_date} {event.event_time && `at ${event.event_time}`}
                    </div>
                    {event.setlists && (
                      <Badge variant="outline" className="mt-1">{event.setlists.name}</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/calendar">View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming events scheduled</p>
            )}
            <Button className="w-full" asChild>
              <Link href="/calendar">View Full Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recently Used Songs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Recently Used Songs
            </CardTitle>
            <CardDescription>Songs from your latest services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSongs.length > 0 ? (
              recentSongs.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{song.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Key: {song.key || 'N/A'} • Last used: {song.last_used || 'Never'}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/songs">Edit</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recently used songs</p>
            )}
            <Button className="w-full" asChild>
              <Link href="/songs">Browse All Songs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild>
              <Link href="/songs/new">Add New Song</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/setlists/new">Create Setlist</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/members/new">Add Team Member</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/export">Export Tools</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
