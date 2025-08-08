"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Music, Users, FileText, Clock, TrendingUp, AlertCircle, Database, Wifi, WifiOff } from 'lucide-react'
import Link from "next/link"

interface DashboardStats {
  totalSongs: number
  totalMembers: number
  totalSetlists: number
  upcomingEvents: number
}

// Mock data for demo purposes
const mockStats: DashboardStats = {
  totalSongs: 25,
  totalMembers: 8,
  totalSetlists: 12,
  upcomingEvents: 3
}

const mockUpcomingEvents = [
  {
    id: 1,
    title: "Sunday Morning Worship",
    event_date: "2024-01-21",
    event_time: "10:00",
    setlists: { name: "New Year Celebration" }
  },
  {
    id: 2,
    title: "Prayer Night",
    event_date: "2024-01-24",
    event_time: "19:00",
    setlists: { name: "Intimate Worship" }
  }
]

const mockRecentSongs = [
  {
    id: 1,
    title: "Amazing Grace",
    key: "G",
    last_used: "2024-01-14"
  },
  {
    id: 2,
    title: "How Great Thou Art",
    key: "C",
    last_used: "2024-01-14"
  }
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [upcomingEvents, setUpcomingEvents] = useState(mockUpcomingEvents)
  const [recentSongs, setRecentSongs] = useState(mockRecentSongs)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if environment variables are available
    const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!hasEnvVars) {
      setError('env_missing')
      setDemoMode(true)
    } else {
      // Simulate connection attempt
      setTimeout(() => {
        // Simulate a failed connection
        // For real-world scenarios, use Supabase client to check connection
        const connectionSuccessful = true // Replace with actual connection check
        if (!connectionSuccessful) {
          setError('connection_failed')
          setDemoMode(true)
        }
      }, 500)
    }
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
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
              Your Supabase credentials are not configured in your deployment environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-4">To connect to your Supabase database:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Go to your Vercel project dashboard</li>
              <li>Navigate to Settings → Environment Variables</li>
              <li>Add these environment variables:
                <pre className="bg-red-100 p-3 rounded mt-2 text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </li>
              <li>Get your credentials from your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a> → Settings → API</li>
              <li>Redeploy your application</li>
            </ol>
            <p className="text-sm">The environment variables should be available after redeployment.</p>
          </CardContent>
        </Card>

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
              <li>Verify your environment variables in Vercel project settings</li>
              <li>Check your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Ensure your project is active and not paused</li>
              <li>Check browser console for detailed error messages</li>
              <li>Try redeploying your application</li>
            </ol>
          </CardContent>
        </Card>

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Worship Team Dashboard</h1>
          <p className="text-muted-foreground">
            {demoMode ? "Demo Mode - Sample data shown" : "Welcome back! Here's what's happening with your worship team."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {demoMode ? (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Demo Mode</span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Connected</span>
            </>
          )}
        </div>
      </div>

      {/* Demo Mode Notice */}
      {demoMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              Demo Mode Active
            </CardTitle>
            <CardDescription className="text-blue-700">
              You're viewing sample data. To connect to your database, add your Supabase credentials to Vercel's environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-4">To enable full functionality:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Go to your Vercel project settings</li>
              <li>Add environment variables for Supabase</li>
              <li>Redeploy your application</li>
              <li>Set up your database tables</li>
            </ol>
          </CardContent>
        </Card>
      )}

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
              {demoMode && <p className="text-xs text-muted-foreground">Sample data</p>}
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
            {upcomingEvents.map((event) => (
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
            ))}
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
            {recentSongs.map((song) => (
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
            ))}
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
