import { createClient } from "@supabase/supabase-js"

/**
 * Script to create the default admin auth user and link it to the seeded member record.
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-default-admin.ts
 *
 * This will:
 *  - Create auth user admin@worship.local with password songadmin*123 (if not exists)
 *  - Link the auth user to members.auth_user_id
 *  - Ensure administrator role assignment
 */
async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) {
    console.error("Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY environment vars.")
    process.exit(1)
  }

  const admin = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } })

  const email = "admin@worship.local"
  const password = "songadmin*123"

  // Try to find existing user
  // Supabase Admin API does not support "get user by email" directly in JS SDK, so try to create and handle conflict.
  const { data: createRes, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createErr && !String(createErr.message).toLowerCase().includes("already registered")) {
    console.error("Failed to create admin user:", createErr.message)
    process.exit(1)
  }

  const authUserId = createRes?.user?.id
  if (authUserId) {
    console.log("Created admin auth user.")
  } else {
    console.log("Admin auth user likely exists already. Proceeding to link by email in members.")
  }

  // Fetch member row (seeded by SQL)
  const { data: member, error: memberErr } = await admin
    .from("members")
    .select("id, auth_user_id")
    .eq("email", email)
    .single()

  if (memberErr) {
    console.error("Failed to fetch default admin member:", memberErr.message)
    process.exit(1)
  }

  // If not linked, update auth_user_id
  if (!member.auth_user_id && authUserId) {
    const { error: updErr } = await admin.from("members").update({ auth_user_id: authUserId }).eq("id", member.id)
    if (updErr) {
      console.error("Failed to link auth user to member:", updErr.message)
      process.exit(1)
    }
    console.log("Linked auth user to member.")
  }

  // Ensure administrator role assigned
  const { data: role, error: roleErr } = await admin.from("roles").select("id").eq("name", "administrator").single()
  if (roleErr || !role) {
    console.error("Failed to get administrator role:", roleErr?.message)
    process.exit(1)
  }
  const { error: assignErr } = await admin.from("user_roles").insert({ member_id: member.id, role_id: role.id })
  if (assignErr && !String(assignErr.message).toLowerCase().includes("duplicate key")) {
    console.error("Failed to assign admin role:", assignErr.message)
    process.exit(1)
  }

  console.log("Default admin is ready: email=admin@worship.local")
  console.log("Remember to sign in and change the password in /profile.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
