import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const baseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = "store-media"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return Boolean(session?.user)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Selecione uma foto ou vídeo." }, { status: 400 })
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return NextResponse.json({ error: "Use uma imagem ou vídeo." }, { status: 400 })
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "O arquivo deve ter no máximo 50 MB." }, { status: 400 })

  const headersJson = { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" }
  await fetch(`${baseUrl}/storage/v1/bucket`, { method: "POST", headers: headersJson, body: JSON.stringify({ id: bucket, name: bucket, public: true, file_size_limit: 52428800 }) })

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-")
  const path = `${crypto.randomUUID()}-${safeName}`
  const upload = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, "Content-Type": file.type, "x-upsert": "false" }, body: await file.arrayBuffer() })
  if (!upload.ok) return NextResponse.json({ error: "Não foi possível enviar o arquivo." }, { status: 502 })
  return NextResponse.json({ url: `${baseUrl}/storage/v1/object/public/${bucket}/${path}`, type: file.type.startsWith("video/") ? "video" : "image" })
}
