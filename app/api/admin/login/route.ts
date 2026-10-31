import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAuthorizedAdmin } from "@/lib/admin-auth"

const INVALID = { error: "E-mail ou senha inválidos." }

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!email || !password || email.length > 254 || password.length > 200) {
    return NextResponse.json(INVALID, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    if (error?.status === 429) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429 })
    }
    if (error && error.code !== "invalid_credentials") console.error("[admin-login] auth error:", error.code, error.message)
    return NextResponse.json(INVALID, { status: 401 })
  }

  if (!(await isAuthorizedAdmin(data.user.id))) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: "Este acesso não está autorizado para o painel." }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
