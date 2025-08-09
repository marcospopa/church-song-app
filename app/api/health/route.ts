import { NextResponse } from "next/server"

export async function GET() {
  try {
    // NUNCA devolvemos valores de env; solo banderas
    const urlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const keySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const envOk = urlSet && keySet

    let connected: boolean | null = null
    let schemaOk: boolean | null = null
    let stats: { totalSongs: number; totalMembers: number; totalSetlists: number; upcomingEvents: number } | null = null

    if (envOk) {
      // Probar conexión sin loggear secretos
      const { testConnection, dashboardApi } = await import("@/lib/database")
      connected = await testConnection()

      if (connected) {
        // Verificar esquema mínimo: existencia de la tabla songs
        try {
          const { supabase } = await import("@/lib/supabase")
          const { error } = await supabase.from("songs").select("id").limit(1)
          if (error) {
            const relMissing =
              error.code === "42P01" ||
              (typeof error.message === "string" &&
                error.message.toLowerCase().includes("relation") &&
                error.message.toLowerCase().includes("does not exist"))
            schemaOk = !relMissing
          } else {
            schemaOk = true
          }
        } catch {
          schemaOk = false
        }

        // Stats rápidas si esquema OK
        if (schemaOk) {
          try {
            const s = await dashboardApi.getStats()
            stats = {
              totalSongs: s.totalSongs ?? 0,
              totalMembers: s.totalMembers ?? 0,
              totalSetlists: s.totalSetlists ?? 0,
              upcomingEvents: s.upcomingEvents ?? 0,
            }
          } catch {
            stats = null
          }
        }
      }
    }

    return NextResponse.json(
      {
        env: { urlSet, keySet, envOk },
        connected,
        schemaOk,
        stats,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    )
  } catch {
    return NextResponse.json(
      {
        env: { urlSet: false, keySet: false, envOk: false },
        connected: false,
        schemaOk: null,
        stats: null,
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
        },
      },
    )
  }
}
