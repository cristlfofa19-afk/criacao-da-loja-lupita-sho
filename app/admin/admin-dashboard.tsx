"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

type Item = { id: string; name: string; price: number; media_url: string | null; description: string }
const sections = ["Produtos", "Categorias", "Promoções e cupons", "Novidades", "Pagamentos", "Aparência e textos"]

export default function AdminDashboard({ name }: { name: string }) {
  const [active, setActive] = useState("Produtos")
  const [items, setItems] = useState<Item[]>([])
  const [editing, setEditing] = useState<Item | null>(null)
  const [form, setForm] = useState({ name: "", price: "", media_url: "", description: "" })
  const [message, setMessage] = useState("")

  async function loadItems() {
    const response = await fetch("/api/admin/items", { cache: "no-store" })
    if (response.ok) setItems(await response.json())
    else setMessage("Não foi possível carregar os itens.")
  }
  useEffect(() => { loadItems() }, [])
  function startEdit(item?: Item) {
    setEditing(item ?? null)
    setForm(item ? { name: item.name, price: String(item.price), media_url: item.media_url ?? "", description: item.description } : { name: "", price: "", media_url: "", description: "" })
    setMessage("")
  }
  async function saveItem(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch("/api/admin/items", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editing?.id }) })
    if (!response.ok) { setMessage((await response.json()).error ?? "Erro ao salvar"); return }
    setMessage("Item salvo com sucesso."); setEditing(null); setForm({ name: "", price: "", media_url: "", description: "" }); await loadItems()
  }
  async function logout() { await authClient.signOut(); window.location.href = "/admin/login" }
  return <main className="min-h-screen bg-[#07050b] p-6 text-white"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-4xl font-black">Painel administrativo</h1><p className="mt-2 text-white/60">Olá, {name}. Escolha uma seção para abrir seus controles.</p></div><button onClick={logout} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:border-fuchsia-400 hover:text-white">Sair</button></div><div className="mt-8 grid gap-4 md:grid-cols-3">{sections.map(item => <button type="button" key={item} onClick={() => setActive(item)} className={`rounded-2xl border p-6 text-left transition hover:-translate-y-1 hover:border-fuchsia-400/70 ${active === item ? "border-fuchsia-400/70 bg-fuchsia-500/10" : "border-fuchsia-400/20 bg-white/[0.05]"}`}><h2 className="font-bold">{item}</h2><p className="mt-2 text-sm text-white/45">Gerencie esta seção da sua loja.</p><span className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-fuchsia-200">Abrir →</span></button>)}</div><section className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-white/[0.04] p-6"><p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">Seção aberta</p><h2 className="mt-2 text-2xl font-black">{active}</h2>{active === "Produtos" ? <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]"><form onSubmit={saveItem} className="rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5"><h3 className="text-lg font-bold">{editing ? "Editar item" : "Adicionar item"}</h3><div className="mt-4 grid gap-3"><input required className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do item" /><input required type="number" min="0" step="0.01" className="admin-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Preço" /><input className="admin-input" value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="URL da imagem ou vídeo" /><textarea className="admin-input min-h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição completa" /><div className="flex gap-3"><button className="admin-primary" type="submit">{editing ? "Salvar alterações" : "Cadastrar item"}</button>{editing && <button type="button" className="admin-secondary" onClick={() => startEdit()}>Cancelar</button>}</div>{message && <p className="text-sm text-fuchsia-200">{message}</p>}</div></form><div className="rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Itens cadastrados</h3><button className="admin-secondary" onClick={loadItems}>Atualizar</button></div><div className="mt-4 grid gap-3">{items.length ? items.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-4"><div><p className="font-bold">{item.name}</p><p className="text-sm text-white/55">R$ {Number(item.price).toFixed(2).replace(".", ",")}</p></div><button className="admin-secondary" onClick={() => startEdit(item)}>Editar</button></div>) : <p className="py-8 text-center text-sm text-white/50">Nenhum item cadastrado ainda.</p>}</div></div></div> : <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5"><button className="admin-primary" type="button" onClick={() => setMessage(`O painel de ${active.toLowerCase()} foi aberto.`)}>Adicionar novo</button>{message && <p className="mt-4 text-sm text-fuchsia-200">{message}</p>}</div>}</section></div></main>
}
