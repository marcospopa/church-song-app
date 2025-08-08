"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, MapPin, Users } from 'lucide-react'

const events = [
  {
    id: 1,
    title: "Sunday Morning Worship",
    date: "2024-01-14",
    time: "10:00 AM",
    type: "Service",
    location: "Main Sanctuary",
    setlist: "Sunday Morning Worship",
    members: ["Sarah Johnson", "Mike Chen", "Emily Rodriguez", "David Kim"]
  },
  {
    id: 2,
    title: "Worship Team Rehearsal",
    date: "2024-01-16",
    time: "7:00 PM",
    type: "Rehearsal",
    location: "Music Room",
    setlist: "Prayer Night Intimate",
    members: ["Sarah Johnson", "Emily Rodriguez"]
  },
  {
    id: 3,
    title: "Prayer Night",
    date: "2024-01-17",
    time: "7:00 PM",
    type: "Service",
    location: "Chapel",
    setlist: "Prayer Night Intimate",
    members: ["Sarah Johnson", "Emily Rodriguez"]
  },
  {
    id: 4,
    title: "Sunday Morning Worship",
    date: "2024-01-21",
    time: "10:00 AM",
    type: "Service",
    location: "Main Sanctuary",
    setlist: "New Year Celebration",
    members: ["Sarah Johnson", "Mike Chen", "Emily Rodriguez", "David Kim"]
  }
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const selectedDateEvents = events.filter(event => {
    if (!selectedDate) return false
    const eventDate = new Date(event.date)
    return eventDate.toDateString() === selectedDate.toDateString()
  })

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage worship services and rehearsals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Schedule a new worship service or rehearsal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input id="event-title" placeholder="Sunday Morning Worship" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input id="event-time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="rehearsal">Rehearsal</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <Input id="event-location" placeholder="Main Sanctuary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-notes">Notes</Label>
                <Textarea id="event-notes" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Save Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Click on a date to view scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next scheduled services and rehearsals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge variant={event.type === "Service" ? "default" : "secondary"}>
                    {event.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.members.length} members
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {selectedDate.toLocaleDateString()}
            </CardTitle>
            <CardDescription>Scheduled events for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant={event.type === "Service" ? "default" : "secondary"}>
                      {event.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Setlist: {event.setlist}</div>
                    <div className="text-sm text-muted-foreground">
                      Team: {event.members.join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
