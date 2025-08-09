"use client"

import { useEffect, useMemo, useState } from "react"
import { songsApi, setlistsApi } from "@/lib/database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type Props = {
  open?: boolean
  setlistId?: string
  existingSongIds?: string[]
  nextOrderIndex?: number
  onClose?: () => void
  onAdded?: () => void
}

type SongLite = { id: string; title: string; key: string | null; genre: string | null }

export default function AddSetlistSongModal({
  open = false,
  setlistId = "",
  existingSongIds = [],
  nextOrderIndex = 1,
  onClose,
  onAdded,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [songs, setSongs] = useState<SongLite[]>([])
  const [search, setSearch] = useState("")
  const [selectedSongId, setSelectedSongId] = useState<string>("")
  const [orderIndex, setOrderIndex] = useState<number>(nextOrderIndex)
  const [keyOverride, setKeyOverride] = useState<string>("")

  useEffect(() => {
    let active = true
    async function load() {
      if (!open) return
      const all = await songsApi.getAll()
      const lites: SongLite[] = (all || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        key: s.key || null,
        genre: s.genre || null,
      }))
      if (active) setSongs(lites)
    }
    load()
    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    setOrderIndex(nextOrderIndex)
  }, [nextOrderIndex])

  const filtered = useMemo(() => {
    return songs
      .filter((s) => !existingSongIds.includes(s.id))
      .filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          (s.genre || "").toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 50)
  }, [songs, existingSongIds, search])

  const add = async () => {
    if (!setlistId || !selectedSongId) return
    setLoading(true)
    try {
      await setlistsApi.addSong(setlistId, selectedSongId, orderIndex, keyOverride || undefined)
      onAdded?.()
      onClose?.()
    } catch (e) {
      console.error("Failed to add song:", e)
      alert("No se pudo agregar la canción al setlist.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose?.() : null)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agregar canción al setlist</DialogTitle>
          <DialogDescription>Selecciona una canción, su orden y una clave alternativa (opcional)</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Búsqueda</Label>
            <Input
              placeholder="Buscar por título o género..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Selecciona canción</Label>
            <ScrollArea className="h-56 rounded border p-2">
              <div className="space-y-2">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSongId(s.id)}
                    className={`w-full text-left p-2 rounded border ${selectedSongId === s.id ? "bg-secondary" : "bg-background"}`}
                  >
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      {s.key && <Badge variant="outline">Key {s.key}</Badge>}
                      {s.genre && <Badge variant="secondary">{s.genre}</Badge>}
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <div className="text-sm text-muted-foreground p-2">No hay resultados</div>}
              </div>
            </ScrollArea>
            {selectedSongId && <div className="text-xs text-muted-foreground">Seleccionado: {selectedSongId}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number.parseInt(e.target.value || "1"))}
              />
            </div>
            <div className="space-y-2">
              <Label>Key override (opcional)</Label>
              <Select value={keyOverride} onValueChange={setKeyOverride}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin cambio" />
                </SelectTrigger>
                <SelectContent>
                  {["", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
                    <SelectItem key={k || "none"} value={k}>
                      {k || "Sin cambio"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={add} disabled={!selectedSongId || loading}>
            {loading ? "Agregando..." : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
