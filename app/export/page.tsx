"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Music, Users, CalendarIcon as CalIcon, Printer, Mail, Share } from "lucide-react"
import { setlistsApi, songsApi, membersApi, eventsApi } from "@/lib/database"

type SimpleSetlist = { id: string; name: string; service_date: string | null }
type SimpleSong = { id: string; title: string; key: string | null }
type SimpleMember = { id: string; name: string; email: string | null }
type SimpleEvent = {
  id: string
  title: string
  event_date: string
  event_time: string | null
  event_type: string | null
}

export default function ExportPage() {
  const [setlists, setSetlists] = useState<SimpleSetlist[]>([])
  const [songs, setSongs] = useState<SimpleSong[]>([])
  const [members, setMembers] = useState<SimpleMember[]>([])
  const [upcoming, setUpcoming] = useState<SimpleEvent[]>([])

  const [selectedSetlists, setSelectedSetlists] = useState<string[]>([])
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("txt")
  const [includeChords, setIncludeChords] = useState(true)
  const [includeLyrics, setIncludeLyrics] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(false)

  const mostRecentSetlist = useMemo(() => {
    const sl = [...setlists].sort((a, b) => (b.service_date || "").localeCompare(a.service_date || ""))[0]
    return sl
  }, [setlists])

  useEffect(() => {
    async function load() {
      const [sl, sg, mb, ev] = await Promise.all([
        setlistsApi.getAll(),
        songsApi.getAll(),
        membersApi.getAll(),
        eventsApi.getUpcoming(20),
      ])
      setSetlists(
        (Array.isArray(sl) ? sl : []).map((s: any) => ({
          id: s.id,
          name: s.name,
          service_date: s.service_date,
        })),
      )
      setSongs(
        (Array.isArray(sg) ? sg : []).map((s: any) => ({
          id: s.id,
          title: s.title,
          key: s.key || null,
        })),
      )
      setMembers(
        (Array.isArray(mb) ? mb : []).map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email || null,
        })),
      )
      setUpcoming(
        (Array.isArray(ev) ? ev : []).map((e: any) => ({
          id: e.id,
          title: e.title,
          event_date: e.event_date,
          event_time: e.event_time || null,
          event_type: e.event_type || null,
        })),
      )
    }
    load()
  }, [])

  const toggleSetlist = (id: string) =>
    setSelectedSetlists((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleSong = (id: string) =>
    setSelectedSongs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  function download(filename: string, content: string, mime = "text/plain") {
    const blob = new Blob([content], { type: mime + ";charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatSetlistText(sl: SimpleSetlist) {
    return `Setlist: ${sl.name}
Date: ${sl.service_date || "-"}
`
  }

  function formatSongText(sg: any) {
    const chords = includeChords && sg.chords ? `Chords:\n${sg.chords}\n` : ""
    const lyrics = includeLyrics && sg.lyrics ? `Lyrics:\n${sg.lyrics}\n` : ""
    const notes = includeNotes && sg.notes ? `Notes:\n${sg.notes}\n` : ""
    return `Title: ${sg.title}
Key: ${sg.key || "-"}
${lyrics}${chords}${notes}---`
  }

  async function handleExport(type: string) {
    if (type === "current-setlist") {
      if (!mostRecentSetlist) {
        alert("No setlists to export.")
        return
      }
      // fetch full setlist detail
      const full = await setlistsApi.getById(mostRecentSetlist.id)
      const songsTxt =
        (full?.setlist_songs || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map(
            (x: any, i: number) => `${i + 1}. ${x.songs?.title || "Song"} (${x.key_override || x.songs?.key || "-"})`,
          )
          .join("\n") || "-"
      const content =
        formatSetlistText(mostRecentSetlist) +
        `Songs:
${songsTxt}
`
      download(`setlist-${mostRecentSetlist.name}.txt`, content)
      return
    }

    if (type === "all-songs") {
      // need full songs for lyrics/chords
      const all = await songsApi.getAll()
      const lines = all.map(formatSongText).join("\n")
      download("songs.txt", lines)
      return
    }

    if (type === "member-list") {
      const lines = members.map((m) => `${m.name} ${m.email ? `<${m.email}>` : ""}`).join("\n")
      download("members.txt", lines)
      return
    }

    if (type === "calendar") {
      const lines =
        upcoming
          .map((e) => `${e.event_date} ${e.event_time || ""} - ${e.title} [${e.event_type || "event"}]`)
          .join("\n") || "No upcoming events."
      download("calendar.txt", lines)
      return
    }

    if (type === "print") {
      window.print()
      return
    }

    if (type === "email") {
      alert("Generate an email with attachments is out of scope for now.")
      return
    }

    if (type === "share") {
      alert("Share link generation is out of scope for now.")
      return
    }

    if (type === "custom") {
      // Build from selected items
      const parts: string[] = []
      for (const id of selectedSetlists) {
        const sl = setlists.find((s) => s.id === id)
        if (!sl) continue
        const full = await setlistsApi.getById(id)
        const songsTxt =
          (full?.setlist_songs || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map(
              (x: any, i: number) => `${i + 1}. ${x.songs?.title || "Song"} (${x.key_override || x.songs?.key || "-"})`,
            )
            .join("\n") || "-"
        parts.push(formatSetlistText(sl) + `Songs:\n${songsTxt}\n`)
      }
      if (selectedSongs.length) {
        const all = await songsApi.getAll()
        const chosen = all.filter((s) => selectedSongs.includes(s.id))
        parts.push(chosen.map(formatSongText).join("\n"))
      }
      const content = parts.join("\n\n")
      const fname = exportFormat === "txt" ? "export.txt" : exportFormat === "html" ? "export.html" : "export.txt"
      const mime =
        exportFormat === "html"
          ? "text/html"
          : exportFormat === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "text/plain"
      download(fname, content, mime)
      return
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Tools</h1>
        <p className="text-muted-foreground">Export setlists, songs, and reports for printing or sharing (live data)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Quick Export
            </CardTitle>
            <CardDescription>Export common items with default settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("current-setlist")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export Current Setlist
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("all-songs")}
            >
              <Music className="mr-2 h-4 w-4" />
              Export All Songs Database
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("member-list")}
            >
              <Users className="mr-2 h-4 w-4" />
              Export Member List
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("calendar")}
            >
              <CalIcon className="mr-2 h-4 w-4" />
              Export Calendar Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Actions</CardTitle>
            <CardDescription>Additional export and sharing options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("print")}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Current Selection
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("email")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email to Team Members
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("share")}
            >
              <Share className="mr-2 h-4 w-4" />
              Generate Share Link
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Export</CardTitle>
          <CardDescription>Select specific items and customize export settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">Plain Text</SelectItem>
                <SelectItem value="html">HTML Page</SelectItem>
                <SelectItem value="docx">Word Document (basic text)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Include in Export</Label>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-lyrics"
                  checked={includeLyrics}
                  onCheckedChange={(v) => setIncludeLyrics(Boolean(v))}
                />
                <Label htmlFor="include-lyrics">Song Lyrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-chords"
                  checked={includeChords}
                  onCheckedChange={(v) => setIncludeChords(Boolean(v))}
                />
                <Label htmlFor="include-chords">Chord Charts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-notes"
                  checked={includeNotes}
                  onCheckedChange={(v) => setIncludeNotes(Boolean(v))}
                />
                <Label htmlFor="include-notes">Team Notes</Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Select Setlists</Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {setlists.map((sl) => (
                <div key={sl.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={sl.id}
                    checked={selectedSetlists.includes(sl.id)}
                    onCheckedChange={() => toggleSetlist(sl.id)}
                  />
                  <Label htmlFor={sl.id} className="flex-1">
                    {sl.name} {sl.service_date ? `(${sl.service_date})` : ""}
                  </Label>
                </div>
              ))}
              {setlists.length === 0 && <div className="text-sm text-muted-foreground">No setlists found.</div>}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Select Individual Songs</Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={song.id}
                    checked={selectedSongs.includes(song.id)}
                    onCheckedChange={() => toggleSong(song.id)}
                  />
                  <Label htmlFor={song.id} className="flex-1">
                    {song.title} {song.key ? `(Key: ${song.key})` : ""}
                  </Label>
                </div>
              ))}
              {songs.length === 0 && <div className="text-sm text-muted-foreground">No songs found.</div>}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => handleExport("custom")}
              disabled={selectedSetlists.length === 0 && selectedSongs.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected Items
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
