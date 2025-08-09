"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { setlistsApi } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import AddSetlistSongModal from "@/components/modals/add-setlist-song-modal"

export default function SetlistDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [setlist, setSetlist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [songToRemove, setSongToRemove] = useState<any>(null)

  const [form, setForm] = useState({
    name: "",
    service_date: "",
    service_type: "",
    status: "draft",
    notes: "",
  })

  // Modal add song
  const [addOpen, setAddOpen] = useState(false)

  async function load() {
    setLoading(true)
    const data = await setlistsApi.getById(params.id)
    if (data) {
      setSetlist(data)
      setForm({
        name: data.name,
        service_date: data.service_date || "",
        service_type: data.service_type || "",
        status: data.status || "draft",
        notes: data.notes || "",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [params.id])

  const updateField = (field: keyof typeof form, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const save = async () => {
    setSaving(true)
    try {
      await setlistsApi.update(params.id, {
        name: form.name,
        service_date: form.service_date || null,
        service_type: form.service_type || null,
        status: form.status,
        notes: form.notes || null,
      })
      router.push("/setlists")
    } catch (e) {
      console.error("Failed to update setlist:", e)
      alert("No se pudo guardar el setlist.")
    } finally {
      setSaving(false)
    }
  }

  const songs = useMemo(
    () => (setlist?.setlist_songs || []).sort((a: any, b: any) => a.order_index - b.order_index),
    [setlist],
  )

  const existingSongIds = useMemo(() => songs.map((s: any) => s.song_id), [songs])
  const nextOrderIndex = useMemo(() => (songs.length ? songs[songs.length - 1].order_index + 1 : 1), [songs])

  const removeSong = async () => {
    if (!songToRemove) return
    try {
      await setlistsApi.removeSong(params.id, songToRemove.song_id)
      setDeleteOpen(false)
      setSongToRemove(null)
      await load()
    } catch (e) {
      console.error("Failed to remove song:", e)
      alert("No se pudo eliminar la canción del setlist.")
    }
  }

  if (loading) return <div className="p-6">Cargando setlist...</div>
  if (!setlist) return <div className="p-6">Setlist no encontrado.</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar setlist</h1>
          <p className="text-muted-foreground">ID: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del setlist</CardTitle>
          <CardDescription>Edita la información básica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input required value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={form.service_date || ""}
                onChange={(e) => updateField("service_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.service_type} onValueChange={(v) => updateField("service_type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                  <SelectItem value="Prayer Night">Prayer Night</SelectItem>
                  <SelectItem value="Youth Service">Youth Service</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Canciones en el setlist</CardTitle>
            <CardDescription>Agrega o quita canciones</CardDescription>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar canción
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {songs.length ? (
            songs.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {s.order_index}. {s.songs?.title || "Canción"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {s.key_override ? `Key: ${s.key_override}` : s.songs?.key ? `Key: ${s.songs.key}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.songs?.key && <Badge variant="outline">{s.songs.key}</Badge>}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setSongToRemove(s)
                      setDeleteOpen(true)
                    }}
                    className="h-8 w-8"
                    aria-label="Eliminar canción del setlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Aún no hay canciones en este setlist.</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar canción del setlist?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={removeSong}>Quitar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddSetlistSongModal
        open={addOpen}
        setlistId={params.id}
        existingSongIds={existingSongIds}
        nextOrderIndex={nextOrderIndex}
        onClose={() => setAddOpen(false)}
        onAdded={() => load()}
      />
    </div>
  )
}
