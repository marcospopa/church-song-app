import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase-admin"

export async function POST() {
  try {
    const admin = getAdminClient()

    // Check if a member row is flagged as default admin and already linked to auth
    const { data: member, error: mErr } = await admin
      .from("members")
      .select("id, email, auth_user_id, is_default_admin")
      .eq("email", "admin@worship.local")
      .single()

    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

    if (member?.auth_user_id) {
      return NextResponse.json({ ok: true, message: "Default admin already linked." })
    }

    // Create auth user with fixed password
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: "admin@worship.local",
      password: "songadmin*123",
      email_confirm: true,
    })
    if (createErr || !created.user) {
      return NextResponse.json({ error: createErr?.message || "Failed to create auth user" }, { status: 500 })
    }

    const authUserId = created.user.id

    // Link to member
    const { error: updErr } = await admin
      .from("members")
      .update({ auth_user_id: authUserId, is_default_admin: true })
      .eq("id", member.id)

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    // Ensure admin role assigned
    const { data: role, error: rErr } = await admin.from("roles").select("id").eq("name", "administrator").single()
    if (rErr || !role) {
      return NextResponse.json({ error: rErr?.message || "Role administrator not found" }, { status: 500 })
    }

    const { error: urErr } = await admin.from("user_roles").insert({ member_id: member.id, role_id: role.id })
    if (urErr && !String(urErr.message).includes("duplicate")) {
      return NextResponse.json({ error: urErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: "Default admin created and linked." })
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
