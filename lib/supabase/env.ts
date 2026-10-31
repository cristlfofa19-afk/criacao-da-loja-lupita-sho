// The v0-managed Supabase integration points to a newly provisioned project.
// LUPITA_* variables pin the app to the original "lupitashopee" project, but only
// when they look like real Supabase values, so a mistyped variable can't break the app.
const looksLikeSupabaseUrl = (value?: string) => !!value && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(value.trim())
const looksLikeSupabaseKey = (value?: string) =>
  !!value && (/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(value.trim()) || /^sb_(publishable|secret)_[\w-]{20,}$/.test(value.trim()))

const lupitaConfigured =
  looksLikeSupabaseUrl(process.env.LUPITA_SUPABASE_URL) &&
  looksLikeSupabaseKey(process.env.LUPITA_SUPABASE_ANON_KEY) &&
  looksLikeSupabaseKey(process.env.LUPITA_SUPABASE_SERVICE_ROLE_KEY)

export const supabaseUrl = (
  lupitaConfigured
    ? process.env.LUPITA_SUPABASE_URL!
    : process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
)
  .trim()
  .replace(/\/$/, "")

export const supabaseAnonKey = (
  lupitaConfigured
    ? process.env.LUPITA_SUPABASE_ANON_KEY!
    : process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""
).trim()

export const supabaseServiceRoleKey = (
  lupitaConfigured ? process.env.LUPITA_SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_SERVICE_ROLE_KEY || ""
).trim()
