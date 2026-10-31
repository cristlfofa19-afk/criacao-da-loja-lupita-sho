// The v0-managed Supabase integration points to a newly provisioned project.
// LUPITA_* variables pin the app to the original "lupitashopee" project and win when set.
export const supabaseUrl = process.env.LUPITA_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""

export const supabaseAnonKey =
  process.env.LUPITA_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""

export const supabaseServiceRoleKey = process.env.LUPITA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
