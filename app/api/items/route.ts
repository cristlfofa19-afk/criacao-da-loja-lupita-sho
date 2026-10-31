import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const response = await fetch(`${baseUrl}/rest/v1/store_items?select=id,name,price,media_url,description&order=created_at.desc`, { headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" })
  return NextResponse.json(await response.json(), { status: response.status })
}
