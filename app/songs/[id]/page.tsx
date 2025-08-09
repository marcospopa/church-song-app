"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { songsApi } from "@/lib/database"
import type { Song } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SongDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [form, setForm] = useState({
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
    notes: "",
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await songsApi.getById(params.id)
      if (data) {
        setSong(data)
        setTags(data.tags || [])
        setForm({
          title: data.title,
          artist: data.artist || "",
          key: data.key || "",
          tempo: data.tempo?.toString() || "",
          genre: data.genre || "",
          duration: data.duration || "",
          ccli_number: data.ccli_number || "",
          copyright: data.copyright || "",
          lyrics: data.lyrics || "",
          chords: data.chords || "",
          notes: data.notes || "",
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const save = async () => {
    if (!song) return
    setSaving(true)
    try {
      await songsApi.update(song.id, {
        title: form.title,
        artist: form.artist || null,
        key: form.key || null,
        tempo: form.tempo ? Number.parseInt(form.tempo) : null,
        genre: form.genre || null,
        duration: form.duration || null,
        ccli_number: form.ccli_number || null,
        copyright: form.copyright || null,
        lyrics: form.lyrics || null,
        chords: form.chords || null,
        notes: form.notes || null,
        tags: tags.length ? tags : null,
      })
      router.push("/songs")
    } catch (e) {
      console.error("Failed to save song:", e)
      alert("No se pudo guardar la canción.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!song) return
    try {
      await songsApi.delete(song.id)
      router.push("/songs")
    } catch (e) {
      console.error("Failed to delete song:", e)
      alert("No se pudo eliminar la canción.")
    }
  }

  if (loading) {
    return <div className="p-6">Cargando canción...</div>
  }

  if (!song) {
    return <div className="p-6">Canción no encontrada.</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar canción</h1>
          <p className="text-muted-foreground">ID: {song.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Eliminar</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta canción?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>Edita los campos necesarios y guarda los cambios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Artista/Autor</Label>
            <Input value={form.artist} onChange={(e) => updateField("artist", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Clave</Label>
              <Select value={form.key} onValueChange={(v) => updateField("key", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la clave" />
                </SelectTrigger>
                <SelectContent>
                  {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tempo (BPM)</Label>
              <Input type="number" value={form.tempo} onChange={(e) => updateField("tempo", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Género</Label>
            <Select value={form.genre} onValueChange={(v) => updateField("genre", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el género" />
              </SelectTrigger>
              <SelectContent>
                {["Hymn", "Contemporary", "Gospel", "Praise", "Worship"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duración</Label>
              <Input value={form.duration} onChange={(e) => updateField("duration", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CCLI</Label>
              <Input value={form.ccli_number} onChange={(e) => updateField("ccli_number", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Copyright</Label>
            <Input value={form.copyright} onChange={(e) => updateField("copyright", e.target.value)} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Letra</Label>
            <Textarea
              className="min-h-[160px]"
              value={form.lyrics}
              onChange={(e) => updateField("lyrics", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Acordes</Label>
            <Textarea
              className="min-h-[140px] font-mono"
              value={form.chords}
              onChange={(e) => updateField("chords", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              className="min-h-[100px]"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {tags.length ? (
                tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Sin etiquetas</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
