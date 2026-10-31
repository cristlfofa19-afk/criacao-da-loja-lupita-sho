import { createClient } from "@/lib/supabase/server"
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/env"

export type AdminUser = { id: string; email: string; name: string }

export async function isAuthorizedAdmin(userId: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(userId)}`,
    {
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
      cache: "no-store",
    },
  )
  if (!response.ok) return false
  const rows = (await response.json()) as unknown[]
  return rows.length === 1
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return null
  if (!(await isAuthorizedAdmin(user.id))) return null
  return { id: user.id, email: user.email, name: (user.user_metadata?.name as string) || "Administradora" }
}
