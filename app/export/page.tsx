"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Music, Users, Calendar, Printer, Mail, Share } from 'lucide-react'

const exportOptions = {
  setlists: [
    { id: "setlist-1", name: "Sunday Morning Worship", date: "2024-01-14" },
    { id: "setlist-2", name: "Prayer Night Intimate", date: "2024-01-17" },
    { id: "setlist-3", name: "New Year Celebration", date: "2024-01-21" }
  ],
  songs: [
    { id: "song-1", title: "Amazing Grace", key: "G" },
    { id: "song-2", title: "How Great Thou Art", key: "C" },
    { id: "song-3", title: "Blessed Be Your Name", key: "D" }
  ]
}

export default function ExportPage() {
  const [selectedSetlists, setSelectedSetlists] = useState<string[]>([])
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("pdf")
  const [includeChords, setIncludeChords] = useState(true)
  const [includeLyrics, setIncludeLyrics] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(false)

  const handleSetlistToggle = (setlistId: string) => {
    setSelectedSetlists(prev => 
      prev.includes(setlistId) 
        ? prev.filter(id => id !== setlistId)
        : [...prev, setlistId]
    )
  }

  const handleSongToggle = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    )
  }

  const handleExport = (type: string) => {
    // Handle export logic here
    console.log(`Exporting ${type}...`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Tools</h1>
        <p className="text-muted-foreground">Export setlists, songs, and reports for printing or sharing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Export Options */}
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
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('current-setlist')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export Current Setlist
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('all-songs')}
            >
              <Music className="mr-2 h-4 w-4" />
              Export All Songs Database
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('member-list')}
            >
              <Users className="mr-2 h-4 w-4" />
              Export Member List
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('calendar')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Export Calendar Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Actions</CardTitle>
            <CardDescription>Additional export and sharing options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('print')}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Current Selection
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('email')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email to Team Members
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleExport('share')}
            >
              <Share className="mr-2 h-4 w-4" />
              Generate Share Link
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Custom Export */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Export</CardTitle>
          <CardDescription>Select specific items and customize export settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="docx">Word Document</SelectItem>
                <SelectItem value="txt">Plain Text</SelectItem>
                <SelectItem value="html">HTML Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Content Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Include in Export</Label>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-lyrics" 
                  checked={includeLyrics}
                  onCheckedChange={setIncludeLyrics}
                />
                <Label htmlFor="include-lyrics">Song Lyrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-chords" 
                  checked={includeChords}
                  onCheckedChange={setIncludeChords}
                />
                <Label htmlFor="include-chords">Chord Charts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-notes" 
                  checked={includeNotes}
                  onCheckedChange={setIncludeNotes}
                />
                <Label htmlFor="include-notes">Team Notes</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Setlist Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Setlists</Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {exportOptions.setlists.map((setlist) => (
                <div key={setlist.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={setlist.id}
                    checked={selectedSetlists.includes(setlist.id)}
                    onCheckedChange={() => handleSetlistToggle(setlist.id)}
                  />
                  <Label htmlFor={setlist.id} className="flex-1">
                    {setlist.name} ({setlist.date})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Song Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Individual Songs</Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {exportOptions.songs.map((song) => (
                <div key={song.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={song.id}
                    checked={selectedSongs.includes(song.id)}
                    onCheckedChange={() => handleSongToggle(song.id)}
                  />
                  <Label htmlFor={song.id} className="flex-1">
                    {song.title} (Key: {song.key})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => handleExport('custom')}
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
