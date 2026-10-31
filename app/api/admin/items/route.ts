import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { adminRest, isUuid, unauthorized } from "@/lib/admin-rest"

type ItemInput = {
  id?: string
  name?: string
  price?: string | number
  media_url?: string | null
  description?: string
  category_id?: string | null
  subcategory?: string | null
  active?: boolean
  published?: boolean
}

function buildItem(body: ItemInput) {
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) return { error: "Informe o nome do produto." }
  if (name.length > 150) return { error: "O nome do produto deve ter no máximo 150 caracteres." }

  const price = Number(body.price)
  if (body.price === "" || body.price === undefined || !Number.isFinite(price) || price < 0) {
    return { error: "Informe um preço válido (zero ou maior)." }
  }

  const categoryId = body.category_id || null
  if (categoryId && !isUuid(categoryId)) return { error: "Categoria inválida." }

  return {
    data: {
      name,
      price: Math.round(price * 100) / 100,
      media_url: body.media_url || null,
      description: typeof body.description === "string" ? body.description.trim() : "",
      category_id: categoryId,
      subcategory: body.subcategory?.trim() || null,
      active: body.active !== false,
      published: body.published === true,
    },
  }
}

async function categoryExists(id: string | null) {
  if (!id) return true
  const result = await adminRest<{ id: string }[]>(`store_categories?select=id&id=eq.${id}`)
  return result.ok && result.data.length === 1
}

export async function GET() {
  if (!(await getAdminUser())) return unauthorized()
  const result = await adminRest(`store_items?select=*&order=created_at.desc`)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.data)
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const built = buildItem(await request.json().catch(() => ({})))
  if (!built.data) return NextResponse.json({ error: built.error }, { status: 400 })
  if (!(await categoryExists(built.data.category_id))) {
    return NextResponse.json({ error: "A categoria selecionada não existe mais." }, { status: 400 })
  }

  const result = await adminRest<unknown[]>(`store_items`, { method: "POST", body: built.data })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.data[0], { status: 201 })
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const body: ItemInput = await request.json().catch(() => ({}))
  if (!body.id || !isUuid(body.id)) return NextResponse.json({ error: "Produto inválido." }, { status: 400 })
  const built = buildItem(body)
  if (!built.data) return NextResponse.json({ error: built.error }, { status: 400 })
  if (!(await categoryExists(built.data.category_id))) {
    return NextResponse.json({ error: "A categoria selecionada não existe mais." }, { status: 400 })
  }

  const result = await adminRest<unknown[]>(`store_items?id=eq.${body.id}`, {
    method: "PATCH",
    body: { ...built.data, updated_at: new Date().toISOString() },
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  if (result.data.length === 0) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  return NextResponse.json(result.data[0])
}

export async function DELETE(request: Request) {
  if (!(await getAdminUser())) return unauthorized()
  const id = new URL(request.url).searchParams.get("id") || ""
  if (!isUuid(id)) return NextResponse.json({ error: "Produto inválido." }, { status: 400 })

  const result = await adminRest<unknown[]>(`store_items?id=eq.${id}`, { method: "DELETE" })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  if (result.data.length === 0) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
