import fs from "node:fs"
import pg from "pg"
import { createClient } from "@supabase/supabase-js"

const conn = process.env.POSTGRES_URL_NON_POOLING.replace(/[?&]sslmode=[^&]*/, "")
const db = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
await db.connect()
await db.query(fs.readFileSync("/vercel/share/v0-project/scripts/001-store-schema.sql", "utf8"))
console.log("schema ok")

const email = process.env.LUPITA_SUPABASE_URL.trim().toLowerCase()
const password = process.env.LUPITA_SUPABASE_ANON_KEY
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
if (listError) throw listError
let user = list.users.find((u) => u.email?.toLowerCase() === email)
if (!user) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: "Lupita" } })
  if (error) throw error
  user = data.user
  console.log("user created")
} else {
  console.log("user already exists, password not changed")
}
await db.query("insert into public.admin_users (user_id, email) values ($1, $2) on conflict (user_id) do nothing", [user.id, email])
console.log("admin authorized")

const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { error: signInError } = await anon.auth.signInWithPassword({ email, password })
console.log("login test:", signInError ? signInError.code : "ok")

const tables = await db.query("select table_name from information_schema.tables where table_schema='public' order by 1")
console.log(tables.rows.map((r) => r.table_name).join(", "))
await db.end()
