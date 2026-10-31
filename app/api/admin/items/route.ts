import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const baseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const sessionEmail = session?.user?.email?.trim().toLowerCase()
  return Boolean(session?.user && adminEmail && sessionEmail === adminEmail)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const response = await fetch(`${baseUrl}/rest/v1/store_items?select=*&order=created_at.desc`, { headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" })
  return NextResponse.json(await response.json(), { status: response.status })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const body = await request.json()
  if (!body.name?.trim()) return NextResponse.json({ error: "Informe o nome do item" }, { status: 400 })
  const response = await fetch(`${baseUrl}/rest/v1/store_items`, { method: "POST", headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ name: body.name.trim(), price: Number(body.price) || 0, media_url: body.media_url || null, description: body.description || "", category_id: body.category_id || null, active: body.active ?? true, published: body.published ?? true }) })
  return NextResponse.json((await response.json())[0], { status: response.status })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const body = await request.json()
  if (!body.id || !body.name?.trim()) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  const response = await fetch(`${baseUrl}/rest/v1/store_items?id=eq.${encodeURIComponent(body.id)}`, { method: "PATCH", headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ name: body.name.trim(), price: Number(body.price) || 0, media_url: body.media_url || null, description: body.description || "", category_id: body.category_id || null, active: body.active ?? true, published: body.published ?? true, updated_at: new Date().toISOString() }) })
  return NextResponse.json((await response.json())[0], { status: response.status })
}
