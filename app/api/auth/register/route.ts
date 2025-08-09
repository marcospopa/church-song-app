import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password || !name) {
      return NextResponse.json({ error: "email, password, and name are required" }, { status: 400 })
    }

    const admin = getAdminClient()

    // Create auth user (email confirmed)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr || !created.user) {
      return NextResponse.json({ error: createErr?.message || "Failed to create auth user" }, { status: 500 })
    }
    const authUserId = created.user.id

    // Create member row
    const { data: member, error: mErr } = await admin
      .from("members")
      .insert({
        email,
        name,
        status: "active",
        auth_user_id: authUserId,
        church_id: (await admin.from("churches").select("id").limit(1).single()).data?.id,
        join_date: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single()
    if (mErr) {
      return NextResponse.json({ error: mErr.message }, { status: 500 })
    }

    // Assign default role "musician"
    const { data: role, error: rErr } = await admin.from("roles").select("id").eq("name", "musician").single()
    if (rErr || !role) {
      return NextResponse.json({ error: rErr?.message || "Missing default role" }, { status: 500 })
    }
    const { error: urErr } = await admin.from("user_roles").insert({ member_id: member.id, role_id: role.id })
    if (urErr) {
      return NextResponse.json({ error: urErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.message?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Server missing SUPABASE_SERVICE_ROLE_KEY. Configure it and redeploy." },
        { status: 501 },
      )
    }
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
