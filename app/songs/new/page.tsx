"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from 'lucide-react'
import { useRouter } from "next/navigation"
import { songsApi } from "@/lib/database"

export default function NewSongPage() {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    key: "",
    tempo: "",
    genre: "",
    duration: "",
    ccli_number: "",
    copyright: "",
    lyrics: "",
    chords: "",
    notes: ""
  })

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await songsApi.create({
        title: formData.title,
        artist: formData.artist || null,
        key: formData.key || null,
        tempo: formData.tempo ? parseInt(formData.tempo) : null,
        genre: formData.genre || null,
        duration: formData.duration || null,
        ccli_number: formData.ccli_number || null,
        copyright: formData.copyright || null,
        lyrics: formData.lyrics || null,
        chords: formData.chords || null,
        notes: formData.notes || null,
        tags: tags.length > 0 ? tags : null,
        last_used: null,
        church_id: '', // This will be set by the API
        created_at: '',
        updated_at: ''
      })

      router.push("/songs")
    } catch (error) {
      console.error('Error creating song:', error)
      alert('Error creating song. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Song</h1>
        <p className="text-muted-foreground">Add a new song to your worship database</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential song details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter song title" 
                  required 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="artist">Artist/Composer</Label>
                <Input 
                  id="artist" 
                  placeholder="Enter artist name" 
                  value={formData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Select value={formData.key} onValueChange={(value) => handleInputChange('key', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="C#">C#</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="D#">D#</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                      <SelectItem value="F#">F#</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="G#">G#</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="A#">A#</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo (BPM)</Label>
                  <Input 
                    id="tempo" 
                    type="number" 
                    placeholder="120" 
                    value={formData.tempo}
                    onChange={(e) => handleInputChange('tempo', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hymn">Hymn</SelectItem>
                    <SelectItem value="Contemporary">Contemporary</SelectItem>
                    <SelectItem value="Gospel">Gospel</SelectItem>
                    <SelectItem value="Praise">Praise</SelectItem>
                    <SelectItem value="Worship">Worship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Optional song metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input 
                  id="duration" 
                  placeholder="4:30" 
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ccli">CCLI Number</Label>
                <Input 
                  id="ccli" 
                  placeholder="Enter CCLI number" 
                  value={formData.ccli_number}
                  onChange={(e) => handleInputChange('ccli_number', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright</Label>
                <Input 
                  id="copyright" 
                  placeholder="© 2024 Publisher" 
                  value={formData.copyright}
                  onChange={(e) => handleInputChange('copyright', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lyrics and Chords */}
        <Card>
          <CardHeader>
            <CardTitle>Lyrics & Chords</CardTitle>
            <CardDescription>Enter the song lyrics and chord progressions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea 
                id="lyrics" 
                placeholder="Enter song lyrics here..."
                className="min-h-[200px]"
                value={formData.lyrics}
                onChange={(e) => handleInputChange('lyrics', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chords">Chord Chart</Label>
              <Textarea 
                id="chords" 
                placeholder="Enter chord progressions and structure..."
                className="min-h-[150px] font-mono"
                value={formData.chords}
                onChange={(e) => handleInputChange('chords', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional notes for the worship team</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Add any special notes, arrangements, or instructions..."
              className="min-h-[100px]"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Song'}
          </Button>
        </div>
      </form>
    </div>
  )
}
