import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseCookieOptions } from "./cookie-options"
import { supabaseAnonKey, supabaseUrl } from "./env"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, ...supabaseCookieOptions }),
          )
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  })
}
