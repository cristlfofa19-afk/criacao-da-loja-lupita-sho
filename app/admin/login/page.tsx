"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, Sparkles } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const result = await authClient.signIn.email({ email, password })
    if (result.error) setError("Email ou senha inválidos.")
    else { router.push("/admin"); router.refresh() }
    setLoading(false)
  }

  return <main className="min-h-screen bg-[#07050b] px-5 py-10 text-white"><div className="mx-auto flex min-h-[80vh] max-w-md items-center"><div className="w-full rounded-[2rem] border border-fuchsia-400/30 bg-white/[0.06] p-7 shadow-[0_0_80px_rgba(236,72,153,0.2)] backdrop-blur-xl"><div className="mb-8 text-center"><div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-fuchsia-300/50 bg-fuchsia-500/15 text-fuchsia-200 shadow-[0_0_30px_rgba(236,72,153,0.55)]"><LockKeyhole /></div><p className="text-xs font-bold uppercase tracking-[0.35em] text-fuchsia-300">Área reservada</p><h1 className="mt-2 text-3xl font-black tracking-tight">Acesso Lupita</h1><p className="mt-2 text-sm text-white/55">Entre para administrar sua loja.</p></div><form onSubmit={handleSubmit} className="grid gap-4"><label className="grid gap-2 text-sm font-semibold">E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-fuchsia-400" placeholder="seu@email.com" /></label><label className="grid gap-2 text-sm font-semibold">Senha<input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-fuchsia-400" placeholder="Sua senha" /></label>{error && <p className="text-sm text-rose-300">{error}</p>}<button disabled={loading} className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-fuchsia-500 font-black uppercase tracking-widest text-black shadow-[0_0_28px_rgba(236,72,153,0.55)] transition hover:bg-fuchsia-300 disabled:opacity-50"><Sparkles className="size-4" />{loading ? "Entrando..." : "Entrar no painel"}</button></form><p className="mt-6 text-center text-xs leading-relaxed text-white/40">Primeiro acesso: <a href="/admin/setup" className="font-bold text-fuchsia-300 underline underline-offset-4">crie sua conta de administradora aqui</a>.</p></div></div></main>
}
