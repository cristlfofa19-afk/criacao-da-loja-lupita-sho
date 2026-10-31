"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"

const sections = ["Produtos", "Categorias", "Promoções e cupons", "Novidades", "Pagamentos", "Aparência e textos"]

export default function AdminDashboard({ name }: { name: string }) {
  const [active, setActive] = useState("Produtos")
  async function logout() { await authClient.signOut(); window.location.href = "/admin/login" }
  return <main className="min-h-screen bg-[#07050b] p-6 text-white"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-4xl font-black">Painel administrativo</h1><p className="mt-2 text-white/60">Olá, {name}. Sua área está protegida.</p></div><button onClick={logout} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:border-fuchsia-400 hover:text-white">Sair</button></div><div className="mt-8 grid gap-4 md:grid-cols-3">{sections.map(item => <button key={item} onClick={() => setActive(item)} className={`rounded-2xl border p-6 text-left shadow-[0_0_30px_rgba(236,72,153,0.08)] transition hover:-translate-y-1 hover:border-fuchsia-400/70 ${active === item ? "border-fuchsia-400/70 bg-fuchsia-500/10" : "border-fuchsia-400/20 bg-white/[0.05]"}`}><h2 className="font-bold">{item}</h2><p className="mt-2 text-sm text-white/45">Gerencie esta seção da sua loja.</p><span className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-fuchsia-200">Abrir →</span></button>)}</div><section className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-white/[0.04] p-6"><p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">Seção aberta</p><h2 className="mt-2 text-2xl font-black">{active}</h2><p className="mt-2 text-white/55">Os controles de {active.toLowerCase()} aparecerão aqui. O clique agora funciona e mantém a seção selecionada.</p></section></div></main>
}
