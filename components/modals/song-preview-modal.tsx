"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { songsApi } from "@/lib/database"
import type { Song } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Pencil } from "lucide-react"

type Props = {
  open?: boolean
  songId?: string | null
  onOpenChange?: (open: boolean) => void
}

export default function SongPreviewModal({ open = false, songId = null, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [song, setSong] = useState<Song | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!open || !songId) return
      setLoading(true)
      const data = await songsApi.getById(songId)
      if (active) setSong(data)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [open, songId])

  const print = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vista de canción</DialogTitle>
          <DialogDescription>Detalle rápido de la canción seleccionada</DialogDescription>
        </DialogHeader>

        {loading && <div className="p-4 text-sm text-muted-foreground">Cargando...</div>}

        {!loading && !song && <div className="p-4 text-sm">No se encontró la canción.</div>}

        {!loading && song && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.artist || "Autor desconocido"}</p>
                <div className="flex gap-2 mt-2">
                  {song.key && <Badge variant="outline">Key {song.key}</Badge>}
                  {song.tempo && <Badge variant="outline">{song.tempo} BPM</Badge>}
                  {song.genre && <Badge variant="secondary">{song.genre}</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={print}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button asChild>
                  <Link href={`/songs/${song.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>

            {song.lyrics && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Letra</h4>
                  <pre className="whitespace-pre-wrap text-sm">{song.lyrics}</pre>
                </CardContent>
              </Card>
            )}

            {song.chords && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Acordes</h4>
                  <pre className="whitespace-pre-wrap text-sm font-mono">{song.chords}</pre>
                </CardContent>
              </Card>
            )}

            {song.notes && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Notas</h4>
                  <p className="text-sm">{song.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
