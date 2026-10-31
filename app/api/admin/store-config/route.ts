import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { adminRest, isUuid, unauthorized } from "@/lib/admin-rest"

const columns = {
  store_categories: ["name", "subcategories", "active"],
  store_coupons: ["code", "discount_type", "value", "category", "product_id", "active"],
  store_cashback_rules: ["percent", "category", "product_id", "active"],
  store_announcements: ["title", "body", "kind", "image_url", "active"],
  store_settings: ["store_name", "whatsapp", "logo_url", "hero_title", "hero_text", "hero_media_url", "hero_media_type"],
  store_payment_settings: ["pix", "credit", "debit", "paypal", "boleto", "whatsapp", "cashback"],
} as const
type Table = keyof typeof columns

const isTable = (value: unknown): value is Table => typeof value === "string" && value in columns
const isSingleton = (table: Table) => table === "store_settings" || table === "store_payment_settings"

function pick(table: Table, body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const column of columns[table]) if (column in body) data[column] = body[column]
  return data
}

function validate(table: Table, data: Record<string, unknown>, partial: boolean): string | null {
  if (table === "store_categories") {
    if (!partial || "name" in data) {
      const name = typeof data.name === "string" ? data.name.trim() : ""
      if (!name) return "Informe o nome da categoria."
      if (name.length > 80) return "O nome da categoria deve ter no máximo 80 caracteres."
      data.name = name
    }
    if ("subcategories" in data) {
      if (!Array.isArray(data.subcategories)) return "Subcategorias inválidas."
      data.subcategories = [...new Set(data.subcategories.map((value) => String(value).trim()).filter(Boolean))]
    }
  }
  if ("product_id" in data && data.product_id && !isUuid(data.product_id)) return "Produto inválido."
  if (table === "store_coupons" && !partial && !String(data.code ?? "").trim()) return "Informe o código do cupom."
  if (table === "store_announcements" && !partial && !String(data.title ?? "").trim()) return "Informe o título."
  return null
}

export async function GET(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const table = new URL(request.url).searchParams.get("table")
  if (!isTable(table)) return NextResponse.json({ error: "Tabela inválida." }, { status: 400 })
  const result = await adminRest(`${table}?select=*&order=created_at.desc`)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.data)
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const body = await request.json().catch(() => ({}))
  if (!isTable(body.table)) return NextResponse.json({ error: "Tabela inválida." }, { status: 400 })
  const table = body.table
  const data = pick(table, body)
  const error = validate(table, data, false)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const singleton = isSingleton(table)
  const result = await adminRest<unknown[]>(`${table}${singleton ? "?on_conflict=id" : ""}`, {
    method: "POST",
    body: singleton ? { ...data, id: true, updated_at: new Date().toISOString() } : data,
    prefer: singleton ? "resolution=merge-duplicates,return=representation" : undefined,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.data[0], { status: 201 })
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const body = await request.json().catch(() => ({}))
  if (!isTable(body.table)) return NextResponse.json({ error: "Tabela inválida." }, { status: 400 })
  const table = body.table
  const singleton = isSingleton(table)
  if (!singleton && !isUuid(body.id)) return NextResponse.json({ error: "Registro inválido." }, { status: 400 })
  const data = pick(table, body)
  const error = validate(table, data, true)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const filter = singleton ? "id=eq.true" : `id=eq.${body.id}`
  const result = await adminRest<unknown[]>(`${table}?${filter}`, {
    method: "PATCH",
    body: { ...data, updated_at: new Date().toISOString() },
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  if (result.data.length === 0) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 })
  return NextResponse.json(result.data[0])
}

export async function DELETE(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const params = new URL(request.url).searchParams
  const table = params.get("table")
  const id = params.get("id")
  if (!isTable(table) || isSingleton(table) || !isUuid(id)) {
    return NextResponse.json({ error: "Registro inválido." }, { status: 400 })
  }
  const result = await adminRest<unknown[]>(`${table}?id=eq.${id}`, { method: "DELETE" })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  if (result.data.length === 0) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
