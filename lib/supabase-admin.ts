import { createClient } from "@supabase/supabase-js"
import type { Database } from "./supabase"

export function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not configured on the server.")
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  })
}
