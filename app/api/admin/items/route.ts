import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const baseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const legacyItems = [
  { id: "legacy-premium", name: "Recarga Premium", price: 29.9, media_url: null, description: "Recarga digital com entrega rápida e atendimento personalizado." },
  { id: "legacy-special", name: "Pacote Especial", price: 59.9, media_url: null, description: "Pacote completo para elevar sua experiência. Consulte disponibilidade." },
]

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false
  return true
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const response = await fetch(`${baseUrl}/rest/v1/store_items?select=*&order=created_at.desc`, { headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" })
  const data = await response.json()
  return NextResponse.json(response.ok && Array.isArray(data) && data.length ? data : legacyItems, { status: response.ok ? 200 : response.status })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const body = await request.json()
  if (!body.name?.trim()) return NextResponse.json({ error: "Informe o nome do item" }, { status: 400 })
  const response = await fetch(`${baseUrl}/rest/v1/store_items`, { method: "POST", headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ name: body.name.trim(), price: Number(body.price) || 0, media_url: body.media_url || null, description: body.description || "" }) })
  return NextResponse.json((await response.json())[0], { status: response.status })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const body = await request.json()
  if (!body.id || !body.name?.trim()) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  const values = { name: body.name.trim(), price: Number(body.price) || 0, media_url: body.media_url || null, description: body.description || "", updated_at: new Date().toISOString() }
  const isLegacy = String(body.id).startsWith("legacy-")
  const response = await fetch(`${baseUrl}/rest/v1/store_items${isLegacy ? "" : `?id=eq.${encodeURIComponent(body.id)}`}`, { method: isLegacy ? "POST" : "PATCH", headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(values) })
  const data = await response.json()
  return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: response.status })
}
