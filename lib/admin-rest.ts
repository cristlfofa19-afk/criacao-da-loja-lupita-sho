import { NextResponse } from "next/server"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID_PATTERN.test(value)

export const unauthorized = () => NextResponse.json({ error: "Não autorizado. Entre novamente no painel." }, { status: 401 })

type RestResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }

const friendlyErrors: Record<string, string> = {
  "23505": "Já existe um registro com esse nome.",
  "23503": "Referência inválida: o item vinculado não existe.",
  "23514": "Algum campo tem um valor inválido.",
  "23502": "Preencha todos os campos obrigatórios.",
  "42P01": "Tabela não encontrada no banco de dados.",
}

/**
 * Server-only PostgREST call using the service role. Callers MUST verify the
 * admin session (getAdminUser) before invoking this.
 */
export async function adminRest<T = unknown>(
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; prefer?: string } = {},
): Promise<RestResult<T>> {
  const baseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey) return { ok: false, status: 500, error: "Conexão com o banco não configurada." }

  const method = options.method ?? "GET"
  try {
    const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        ...(method !== "GET" ? { Prefer: options.prefer ?? "return=representation" } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    })
    const text = await response.text()
    const payload = text ? JSON.parse(text) : null
    if (!response.ok) {
      console.error("[admin-rest]", method, path.split("?")[0], response.status, payload?.code, payload?.message)
      const error = friendlyErrors[payload?.code] ?? "Não foi possível salvar no banco de dados. Tente novamente."
      return { ok: false, status: response.status >= 500 ? 500 : 400, error }
    }
    return { ok: true, data: payload as T }
  } catch (error) {
    console.error("[admin-rest]", method, path.split("?")[0], error)
    return { ok: false, status: 500, error: "Falha de comunicação com o banco de dados." }
  }
}
