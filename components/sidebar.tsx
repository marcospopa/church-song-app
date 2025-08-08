"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Music, FileText, Users, Calendar, Download, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Songs", href: "/songs", icon: Music },
  { name: "Setlists", href: "/setlists", icon: FileText },
  { name: "Members", href: "/members", icon: Users },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Export", href: "/export", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6" />
            <span className="font-semibold">Worship Manager</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "px-2"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
