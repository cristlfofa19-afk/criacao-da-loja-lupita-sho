import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const baseUrl = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const tables = ["store_categories", "store_coupons", "store_cashback_rules", "store_announcements", "store_settings", "store_payment_settings"] as const
type Table = (typeof tables)[number]

async function admin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return Boolean(session?.user)
}
function validTable(value: string): value is Table { return tables.includes(value as Table) }
const headersFor = (json = false) => ({ apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, ...(json ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}) })

export async function GET(request: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const table = new URL(request.url).searchParams.get("table") || ""
  if (!validTable(table)) return NextResponse.json({ error: "Tabela inválida" }, { status: 400 })
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=*&order=created_at.desc`, { headers: headersFor(), cache: "no-store" })
  return NextResponse.json(await response.json(), { status: response.status })
}

export async function POST(request: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const body = await request.json()
  const table = body.table as string
  if (!validTable(table)) return NextResponse.json({ error: "Tabela inválida" }, { status: 400 })
  delete body.table
  const singleton = table === "store_settings" || table === "store_payment_settings"
  const response = await fetch(`${baseUrl}/rest/v1/${table}${singleton ? "?on_conflict=id" : ""}`, { method: "POST", headers: { ...headersFor(true), ...(singleton ? { Prefer: "resolution=merge-duplicates,return=representation" } : {}) }, body: JSON.stringify(body) })
  const data = await response.json()
  return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: response.status })
}

export async function PATCH(request: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const body = await request.json()
  const table = body.table as string
  const id = body.id as string
  if (!validTable(table) || !id) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  delete body.table; delete body.id
  const filter = table === "store_settings" || table === "store_payment_settings" ? "id=eq.true" : `id=eq.${encodeURIComponent(id)}`
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${filter}`, { method: "PATCH", headers: headersFor(true), body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }) })
  const data = await response.json()
  return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: response.status })
}
