"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMessage(null)
      setError(null)
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email ?? null)
      setLoading(false)
    }
    load()
  }, [])

  async function changePassword() {
    setMessage(null)
    setError(null)
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
    if (updateErr) {
      setError(updateErr.message)
      return
    }
    setMessage("Password updated successfully.")
    setNewPassword("")
    setConfirmPassword("")
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = "/auth/sign-in"
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password once logged in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading session...</div>
          ) : email ? (
            <>
              <div className="text-sm">Signed in as: {email}</div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {message && <div className="text-sm text-green-600">{message}</div>}
              <div className="flex justify-between">
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
                <Button onClick={changePassword} disabled={!newPassword || !confirmPassword}>
                  Update Password
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">You must be logged in to change your password.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
