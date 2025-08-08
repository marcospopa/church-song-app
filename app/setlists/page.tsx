"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash, Eye, Copy, Download } from 'lucide-react'
import Link from "next/link"

const setlists = [
  {
    id: 1,
    name: "Sunday Morning Worship",
    date: "2024-01-14",
    service: "Sunday Service",
    songCount: 5,
    duration: "25 min",
    status: "Active",
    songs: ["Amazing Grace", "How Great Thou Art", "Blessed Be Your Name"]
  },
  {
    id: 2,
    name: "Prayer Night Intimate",
    date: "2024-01-17",
    service: "Prayer Night",
    songCount: 4,
    duration: "20 min",
    status: "Draft",
    songs: ["Here I Am to Worship", "10,000 Reasons", "Be Still My Soul"]
  },
  {
    id: 3,
    name: "New Year Celebration",
    date: "2024-01-21",
    service: "Sunday Service",
    songCount: 6,
    duration: "30 min",
    status: "Active",
    songs: ["Blessed Be Your Name", "Great Are You Lord", "Victory in Jesus"]
  },
  {
    id: 4,
    name: "Youth Service Energy",
    date: "2024-01-24",
    service: "Youth Service",
    songCount: 7,
    duration: "35 min",
    status: "Draft",
    songs: ["Alive", "Good Good Father", "Reckless Love"]
  }
]

export default function SetlistsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const filteredSetlists = setlists.filter(setlist => {
    const matchesSearch = setlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setlist.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || setlist.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Setlists</h1>
          <p className="text-muted-foreground">Manage your worship service setlists</p>
        </div>
        <Button asChild>
          <Link href="/setlists/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Setlist
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search setlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status: {selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus("All")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("Active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("Draft")}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("Archived")}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Setlists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Setlists ({filteredSetlists.length})</CardTitle>
          <CardDescription>Your worship service setlists</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Songs</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSetlists.map((setlist) => (
                <TableRow key={setlist.id}>
                  <TableCell className="font-medium">{setlist.name}</TableCell>
                  <TableCell>{setlist.date}</TableCell>
                  <TableCell>{setlist.service}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{setlist.songCount} songs</Badge>
                  </TableCell>
                  <TableCell>{setlist.duration}</TableCell>
                  <TableCell>
                    <Badge variant={setlist.status === "Active" ? "default" : "secondary"}>
                      {setlist.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {setlist.songs.slice(0, 2).join(", ")}
                      {setlist.songs.length > 2 && "..."}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
        </CardContent>
      </Card>
    </div>
  )
}
