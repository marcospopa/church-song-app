"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { setlistsApi } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Download } from "lucide-react"

type ListSetlist = {
  id: string
  name: string
  service_date: string | null
  service_type: string | null
  status: string
  songCount: number
  songsPreview: string[]
}

export default function SetlistsPage() {
  const [setlists, setSetlists] = useState<ListSetlist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All")

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data: any[] = await setlistsApi.getAll()
      const normalized: ListSetlist[] = (data || []).map((sl) => ({
        id: sl.id,
        name: sl.name,
        service_date: sl.service_date,
        service_type: sl.service_type,
        status: sl.status,
        songCount: (sl.setlist_songs || []).length,
        songsPreview: (sl.setlist_songs || []).slice(0, 3).map((x: any) => x.songs?.title || ""),
      }))
      setSetlists(normalized)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return setlists.filter((s) => {
      const matchesSearch = [s.name, s.service_type || ""].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus = status === "All" || s.status === status
      return matchesSearch && matchesStatus
    })
  }, [setlists, search, status])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Setlists</h1>
          <p className="text-muted-foreground">Gestiona tus servicios y listas</p>
        </div>
        <Button asChild>
          <Link href="/setlists/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Setlist
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda y filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar setlists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant={status === "All" ? "secondary" : "outline"} onClick={() => setStatus("All")}>
                All
              </Button>
              <Button variant={status === "active" ? "secondary" : "outline"} onClick={() => setStatus("active")}>
                Active
              </Button>
              <Button variant={status === "draft" ? "secondary" : "outline"} onClick={() => setStatus("draft")}>
                Draft
              </Button>
              <Button variant={status === "archived" ? "secondary" : "outline"} onClick={() => setStatus("archived")}>
                Archived
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setlists ({filtered.length})</CardTitle>
          <CardDescription>Datos en vivo desde Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Canciones</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vista previa</TableHead>
                  <TableHead className="w-[70px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sl) => (
                  <TableRow key={sl.id}>
                    <TableCell className="font-medium">{sl.name}</TableCell>
                    <TableCell>{sl.service_date || "-"}</TableCell>
                    <TableCell>{sl.service_type || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sl.songCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sl.status === "active" ? "default" : "secondary"} className="capitalize">
                        {sl.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sl.songsPreview.filter(Boolean).join(", ") || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/setlists/${sl.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" /> Ver / Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert("Exportar pendiente")}>
                            <Download className="mr-2 h-4 w-4" /> Exportar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
