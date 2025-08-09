"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
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
import { Plus, Clock, MapPin, Users } from "lucide-react"
import { eventsApi, setlistsApi } from "@/lib/database"

type NewEventForm = {
  title: string
  date: string
  time: string
  type: string
  location: string
  notes: string
  setlist_id: string
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [setlists, setSetlists] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<NewEventForm>({
    title: "",
    date: "",
    time: "",
    type: "",
    location: "",
    notes: "",
    setlist_id: "",
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [evts, sls] = await Promise.all([eventsApi.getAll(), setlistsApi.getAll()])
      setEvents(Array.isArray(evts) ? evts : [])
      setSetlists(
        (Array.isArray(sls) ? sls : []).map((s: any) => ({
          id: s.id,
          name: s.name as string,
        })),
      )
      setLoading(false)
    }
    load()
  }, [])

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const d = selectedDate.toDateString()
    return events.filter((e) => new Date(e.event_date).toDateString() === d)
  }, [events, selectedDate])

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.event_date) >= new Date(new Date().toDateString()))
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5)
  }, [events])

  const updateForm = (field: keyof NewEventForm, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const saveEvent = async () => {
    try {
      if (!form.title || !form.date) {
        alert("Title and date are required.")
        return
      }
      await eventsApi.create({
        title: form.title,
        event_date: form.date,
        event_time: form.time || null,
        event_type: form.type || null,
        location: form.location || null,
        setlist_id: form.setlist_id || null,
        notes: form.notes || null,
        created_by: null,
        church_id: "", // filled in API
        created_at: "",
        updated_at: "",
      } as any)
      // Refresh list
      const evts = await eventsApi.getAll()
      setEvents(Array.isArray(evts) ? evts : [])
      setIsDialogOpen(false)
      // reset
      setForm({ title: "", date: "", time: "", type: "", location: "", notes: "", setlist_id: "" })
    } catch (e) {
      console.error("Failed to save event:", e)
      alert("No se pudo guardar el evento.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage worship services and rehearsals (live from Supabase)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>Schedule a new worship service or rehearsal</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  placeholder="Sunday Morning Worship"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={form.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => updateForm("type", v)}>
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
                <Label htmlFor="event-setlist">Setlist (optional)</Label>
                <Select value={form.setlist_id} onValueChange={(v) => updateForm("setlist_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select setlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {setlists.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  placeholder="Main Sanctuary"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-notes">Notes</Label>
                <Textarea
                  id="event-notes"
                  placeholder="Additional notes..."
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEvent}>Save Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Click on a date to view scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <UiCalendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

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
                  <Badge variant={event.event_type === "service" ? "default" : "secondary"}>
                    {event.event_type || "other"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.event_date}
                    {event.event_time ? ` at ${event.event_time}` : ""}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  {Array.isArray(event.event_participants) && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.event_participants.length} members
                    </div>
                  )}
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && <div className="text-sm text-muted-foreground">No upcoming events</div>}
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedDateEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Events for {selectedDate.toLocaleDateString()}</CardTitle>
            <CardDescription>Scheduled events for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant={event.event_type === "service" ? "default" : "secondary"}>
                      {event.event_type || "other"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {event.event_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.event_time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  {event.setlists?.name && <div className="text-sm font-medium">Setlist: {event.setlists.name}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && selectedDate && selectedDateEvents.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No events for {selectedDate.toLocaleDateString()}</CardTitle>
            <CardDescription>Create one using the Add Event button</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
