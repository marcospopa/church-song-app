"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AppGuard } from "@/components/app-guard"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Dedicated login screen at root path without app chrome.
  const isLogin = pathname === "/"

  if (isLogin) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // App chrome (sidebar + header) for all other pages.
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <AppGuard>{children}</AppGuard>
        </main>
      </div>
    </div>
  )
}
