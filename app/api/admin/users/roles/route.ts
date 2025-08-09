import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const admin = getAdminClient()
    const { memberId, roleName } = await req.json()

    if (!memberId || !roleName) return NextResponse.json({ error: "memberId and roleName required" }, { status: 400 })

    const { data: role, error: rErr } = await admin.from("roles").select("id").eq("name", roleName).single()
    if (rErr || !role) return NextResponse.json({ error: rErr?.message || "Role not found" }, { status: 404 })

    const { error: urErr } = await admin.from("user_roles").insert({ member_id: memberId, role_id: role.id })
    if (urErr) return NextResponse.json({ error: urErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.message?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY on the server. Configure it and retry." },
        { status: 501 },
      )
    }
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = getAdminClient()
    const body = await req.json().catch(() => ({}))
    const { memberId, roleName } = body

    if (!memberId || !roleName) return NextResponse.json({ error: "memberId and roleName required" }, { status: 400 })

    const { data: role, error: rErr } = await admin.from("roles").select("id").eq("name", roleName).single()
    if (rErr || !role) return NextResponse.json({ error: rErr?.message || "Role not found" }, { status: 404 })

    const { error: delErr } = await admin.from("user_roles").delete().eq("member_id", memberId).eq("role_id", role.id)

    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.message?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY on the server. Configure it and retry." },
        { status: 501 },
      )
    }
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
