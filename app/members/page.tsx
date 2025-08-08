"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Search, Plus, MoreHorizontal, Edit, Trash, Eye, Mail, Phone } from 'lucide-react'
import Link from "next/link"
import { membersApi } from "@/lib/database"
import type { Member } from "@/lib/supabase"

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, selectedStatus])

  async function loadMembers() {
    try {
      const data = await membersApi.getAll()
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterMembers() {
    let filtered = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (member.instruments && member.instruments.some(inst => inst.toLowerCase().includes(searchTerm.toLowerCase())))
      const matchesStatus = selectedStatus === "All" || member.status === selectedStatus
      return matchesSearch && matchesStatus
    })
    setFilteredMembers(filtered)
  }

  async function deleteMember(id: string) {
    try {
      await membersApi.delete(id)
      setMembers(members.filter(member => member.id !== id))
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">Loading your worship team members...</p>
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
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your worship team members and their roles</p>
        </div>
        <Button asChild>
          <Link href="/members/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
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
                placeholder="Search members, roles, or instruments..."
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
                <DropdownMenuItem onClick={() => setSelectedStatus("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({filteredMembers.length})</CardTitle>
          <CardDescription>Your worship team members</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Instruments</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role || 'No role assigned'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {member.instruments?.map((instrument) => (
                          <Badge key={instrument} variant="secondary" className="text-xs">
                            {instrument}
                          </Badge>
                        )) || 'No instruments'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Mail className="h-3 w-3" />
                        </Button>
                        {member.phone && (
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.join_date}</TableCell>
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteMember(member.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Remove
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
              <p className="text-muted-foreground">No team members found. Add your first member to get started!</p>
              <Button asChild className="mt-4">
                <Link href="/members/new">Add Your First Member</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
