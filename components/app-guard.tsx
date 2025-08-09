"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

const PUBLIC_ROUTES = ["/"]

export function AppGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/")
    }
  }, [loading, user, pathname, router])

  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return <div className="p-6 text-muted-foreground">Checking session...</div>
  }

  return <>{children}</>
}
