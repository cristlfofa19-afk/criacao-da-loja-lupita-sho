import type { CookieOptionsWithName } from "@supabase/ssr"

// The v0 preview renders the app inside a cross-site iframe, where SameSite=Lax
// cookies are never sent, so development needs SameSite=None; Secure.
export const supabaseCookieOptions: CookieOptionsWithName =
  process.env.NODE_ENV === "production"
    ? { sameSite: "lax", secure: true }
    : { sameSite: "none", secure: true }
