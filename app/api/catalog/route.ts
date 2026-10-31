import { NextResponse } from "next/server"
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env"

const baseUrl = supabaseUrl
const publicKey = supabaseAnonKey

export async function GET() {
  if (!baseUrl || !publicKey) return NextResponse.json({ error: "Catálogo indisponível" }, { status: 500 })

  const response = await fetch(
    `${baseUrl}/rest/v1/store_items?select=id,name,price,media_url,description,category_id,store_categories(name)&active=eq.true&published=eq.true&order=created_at.desc`,
    { headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` }, cache: "no-store" },
  )

  if (!response.ok) return NextResponse.json({ error: "Não foi possível carregar o catálogo" }, { status: response.status })
  return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store, max-age=0" } })
}
