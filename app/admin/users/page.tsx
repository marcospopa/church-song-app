"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, ShieldCheck, Trash2 } from "lucide-react"

type Member = {
  id: string
  name: string
  email: string
  status: string
  is_default_admin: boolean
  auth_user_id: string | null
}
type Role = { id: string; name: string }
type UserRole = { member_id: string; role_id: string }

export default function UsersAdminPage() {
  const { roles: myRoles, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!myRoles.includes("administrator")) {
        router.replace("/")
      }
    }
  }, [loading, myRoles, router])

  const [members, setMembers] = useState<Member[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create user dialog
  const [openCreate, setOpenCreate] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "", roleName: "musician" })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function load() {
    setLoadingData(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load users")
      setMembers(data.members || [])
      setRoles(data.roles || [])
      setUserRoles(data.userRoles || [])
    } catch (e: any) {
      setError(e?.message || "Error loading users")
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!loading && myRoles.includes("administrator")) {
      load()
    }
  }, [loading, myRoles])

  const rolesByMember = useMemo(() => {
    const map = new Map<string, Role[]>()
    userRoles.forEach((ur) => {
      const role = roles.find((r) => r.id === ur.role_id)
      if (!role) return
      const arr = map.get(ur.member_id) || []
      arr.push(role)
      map.set(ur.member_id, arr)
    })
    return map
  }, [userRoles, roles])

  async function assignRole(memberId: string, roleName: string) {
    try {
      const res = await fetch("/api/admin/users/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, roleName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to assign role")
      await load()
    } catch (e: any) {
      alert(e?.message || "Failed to assign role")
    }
  }

  async function removeRole(memberId: string, roleName: string) {
    try {
      const res = await fetch("/api/admin/users/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, roleName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to remove role")
      await load()
    } catch (e: any) {
      alert(e?.message || "Failed to remove role")
    }
  }

  async function createUser() {
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          name: newUser.name,
          roles: [newUser.roleName],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create user")
      setOpenCreate(false)
      setNewUser({ email: "", name: "", password: "", roleName: "musician" })
      await load()
    } catch (e: any) {
      setCreateError(e?.message || "Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  if (loading || (!myRoles.includes("administrator") && !loading)) {
    return <div className="p-6 text-muted-foreground">Checking permissions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users & Roles</h1>
          <p className="text-muted-foreground">Manage application users and their access levels</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Role Overview
          </CardTitle>
          <CardDescription>
            Recommended roles: administrator, coordinator, worship_leader, musician, viewer
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <Badge key={r.id} variant={r.name === "administrator" ? "default" : "secondary"} className="capitalize">
              {r.name.replaceAll("_", " ")}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>The default admin cannot be deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Assign Role</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const assigned = rolesByMember.get(m.id) || []
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assigned.map((r) => (
                            <Badge key={r.id} variant="secondary" className="capitalize">
                              {r.name.replaceAll("_", " ")}
                            </Badge>
                          ))}
                          {assigned.length === 0 && <span className="text-sm text-muted-foreground">No roles</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(roleName) => assignRole(m.id, roleName)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((r) => (
                                <SelectItem key={r.id} value={r.name}>
                                  {r.name.replaceAll("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {assigned.map((r) => (
                            <Button key={r.id} variant="outline" size="sm" onClick={() => removeRole(m.id, r.name)}>
                              Remove {r.name}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          disabled={m.is_default_admin}
                          title={m.is_default_admin ? "Default admin cannot be deleted" : "Delete user (admin only)"}
                          onClick={() => alert("User deletion not implemented in this demo.")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Create an authentication user and assign an initial role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                placeholder="Set initial password"
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Role</Label>
              <Select value={newUser.roleName} onValueChange={(v) => setNewUser((p) => ({ ...p, roleName: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.name.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {createError && <div className="text-sm text-red-600">{createError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button onClick={createUser} disabled={creating || !newUser.email || !newUser.password || !newUser.name}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
          <p className="text-xs text-muted-foreground">
            Requires server variable SUPABASE_SERVICE_ROLE_KEY. If missing, the API will respond with configuration
            guidance.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
