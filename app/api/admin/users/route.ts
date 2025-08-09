import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const admin = getAdminClient()
    const body = await req.json().catch(() => ({}))
    const { email, password, name, roles = [] as string[], churchId } = body || {}

    if (!email || !password || !name) {
      return NextResponse.json({ error: "email, password and name are required" }, { status: 400 })
    }

    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr || !createdUser.user) {
      return NextResponse.json({ error: createErr?.message || "Failed to create user" }, { status: 500 })
    }
    const authUserId = createdUser.user.id

    const church = churchId
      ? { id: churchId as string }
      : (await admin.from("churches").select("id").limit(1).single()).data

    const { data: member, error: memberErr } = await admin
      .from("members")
      .insert({
        church_id: church?.id,
        email,
        name,
        status: "active",
        auth_user_id: authUserId,
        join_date: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single()

    if (memberErr) {
      return NextResponse.json({ error: memberErr.message }, { status: 500 })
    }

    if (Array.isArray(roles) && roles.length > 0) {
      const { data: rolesData, error: rolesErr } = await admin.from("roles").select("id, name").in("name", roles)
      if (rolesErr) {
        return NextResponse.json({ error: rolesErr.message }, { status: 500 })
      }
      const rows = (rolesData || []).map((r) => ({ member_id: member.id, role_id: r.id }))
      if (rows.length) {
        const { error: urErr } = await admin.from("user_roles").insert(rows)
        if (urErr) {
          return NextResponse.json({ error: urErr.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true, memberId: member.id, authUserId })
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

export async function GET() {
  try {
    const admin = getAdminClient()

    const { data: members, error: mErr } = await admin
      .from("members")
      .select("id, name, email, status, is_default_admin, auth_user_id")
      .order("name")

    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

    const { data: roles, error: rErr } = await admin.from("roles").select("id, name")
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

    const { data: userRoles, error: urErr } = await admin.from("user_roles").select("member_id, role_id")
    if (urErr) return NextResponse.json({ error: urErr.message }, { status: 500 })

    return NextResponse.json({ members, roles, userRoles })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
