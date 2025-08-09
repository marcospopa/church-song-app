"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { RoleRow } from "@/lib/supabase"

type AuthContextState = {
  loading: boolean
  user: { id: string; email: string | null } | null
  roles: string[]
  memberId: string | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthContextState["user"]>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [memberId, setMemberId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const u = userData.user ? { id: userData.user.id, email: userData.user.email ?? null } : null
      setUser(u)
      if (u) {
        // Load member and roles
        const { data: member } = await supabase.from("members").select("id").eq("auth_user_id", u.id).maybeSingle()
        setMemberId(member?.id ?? null)

        const { data: ur } = await supabase
          .from("user_roles")
          .select("role_id, member_id")
          .in("member_id", member?.id ? [member.id] : ["00000000-0000-0000-0000-000000000000"])

        const { data: allRoles } = await supabase.from("roles").select("id, name")
        const roleNames =
          (ur || []).map((x) => allRoles?.find((r: RoleRow) => r.id === x.role_id)?.name).filter(Boolean) || []
        setRoles(roleNames as string[])
      } else {
        setRoles([])
        setMemberId(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(
    () => ({ loading, user, roles, memberId, refresh: load, signOut }),
    [loading, user, roles, memberId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
