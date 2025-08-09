"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Search, Plus, MoreHorizontal, Edit, Trash, Eye } from "lucide-react"
import Link from "next/link"
import { songsApi } from "@/lib/database"
import type { Song } from "@/lib/supabase"
import SongPreviewModal from "@/components/modals/song-preview-modal"

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)

  // Modal preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSongId, setPreviewSongId] = useState<string | null>(null)

  useEffect(() => {
    loadSongs()
  }, [])

  useEffect(() => {
    filterSongs()
  }, [songs, searchTerm, selectedGenre])

  async function loadSongs() {
    try {
      const data = await songsApi.getAll()
      setSongs(data)
    } catch (error) {
      console.error("Error loading songs:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterSongs() {
    const filtered = songs.filter((song) => {
      const matchesSearch =
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre
      return matchesSearch && matchesGenre
    })
    setFilteredSongs(filtered)
  }

  async function confirmDelete() {
    if (!songToDelete) return
    try {
      await songsApi.delete(songToDelete.id)
      setSongs(songs.filter((song) => song.id !== songToDelete.id))
    } catch (error) {
      console.error("Error deleting song:", error)
      alert("No se pudo eliminar la canción.")
    } finally {
      setDeleteOpen(false)
      setSongToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Song Database</h1>
            <p className="text-muted-foreground">Loading your worship songs...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
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
          <h1 className="text-3xl font-bold">Song Database</h1>
          <p className="text-muted-foreground">Manage your worship songs and chord charts</p>
        </div>
        <Button asChild>
          <Link href="/songs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Song
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {["All", "Hymn", "Contemporary", "Gospel"].map((g) => (
                <Button
                  key={g}
                  variant={selectedGenre === g ? "secondary" : "outline"}
                  onClick={() => setSelectedGenre(g)}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Songs ({filteredSongs.length})</CardTitle>
          <CardDescription>Your complete song library</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSongs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell>{song.artist || "Unknown"}</TableCell>
                    <TableCell>{song.key && <Badge variant="outline">{song.key}</Badge>}</TableCell>
                    <TableCell>{song.tempo ? `${song.tempo} BPM` : "N/A"}</TableCell>
                    <TableCell>{song.genre || "N/A"}</TableCell>
                    <TableCell>{song.last_used || "Never"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {song.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) || "No tags"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setPreviewSongId(song.id)
                              setPreviewOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/songs/${song.id}`} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSongToDelete(song)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No songs found. Add your first song to get started!</p>
              <Button asChild className="mt-4">
                <Link href="/songs/new">Add Your First Song</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar canción?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SongPreviewModal
        open={previewOpen}
        songId={previewSongId}
        onOpenChange={(o) => {
          if (!o) setPreviewOpen(false)
        }}
      />
    </div>
  )
}
