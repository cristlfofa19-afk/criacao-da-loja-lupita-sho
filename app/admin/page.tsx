import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/admin/login")
  return <main className="min-h-screen bg-[#07050b] p-6 text-white"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-4xl font-black">Painel administrativo</h1><p className="mt-2 text-white/60">Olá, {session.user.name}. Sua área está protegida.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{["Produtos", "Categorias", "Promoções e cupons", "Novidades", "Pagamentos", "Aparência e textos"].map(item => <section key={item} className="rounded-2xl border border-fuchsia-400/20 bg-white/[0.05] p-6 shadow-[0_0_30px_rgba(236,72,153,0.08)]"><h2 className="font-bold">{item}</h2><p className="mt-2 text-sm text-white/45">Gerencie esta seção da sua loja.</p><button className="mt-5 rounded-lg border border-fuchsia-400/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-fuchsia-200">Abrir</button></section>)}</div></div></main>
}
