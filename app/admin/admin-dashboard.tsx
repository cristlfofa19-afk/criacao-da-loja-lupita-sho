"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

type Item = { id: string; name: string; price: number; media_url: string | null; description: string }
type Form = { name: string; price: string; media_url: string; description: string }
const sections = ["Produtos", "Categorias", "Promoções e cupons", "Novidades", "Pagamentos", "Aparência e textos"]
const emptyForm: Form = { name: "", price: "", media_url: "", description: "" }

export default function AdminDashboard({ name }: { name: string }) {
  const [active, setActive] = useState("Produtos")
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState<Form>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadItems() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/items", { cache: "no-store" })
      if (!response.ok) throw new Error()
      setItems(await response.json())
    } catch { setMessage("Não foi possível carregar os produtos.") } finally { setLoading(false) }
  }
  useEffect(() => { void loadItems() }, [])

  function openSection(section: string) { setActive(section); setMessage("") }
  function editItem(item: Item) { setActive("Produtos"); setEditingId(item.id); setForm({ name: item.name, price: String(item.price), media_url: item.media_url ?? "", description: item.description }); window.scrollTo({ top: 0, behavior: "smooth" }) }
  function clearForm() { setEditingId(null); setForm(emptyForm) }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("")
    try {
      const response = await fetch("/api/admin/items", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editingId }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar.")
      setMessage(editingId ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.")
      clearForm(); await loadItems()
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar.") } finally { setSaving(false) }
  }
  async function logout() { await authClient.signOut(); window.location.href = "/admin/login" }

  return <main className="min-h-screen bg-[#07050b] p-4 text-white sm:p-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-3xl font-black">Painel administrativo</h1><p className="mt-2 text-sm text-white/60">Olá, {name}. Escolha uma área para administrar sua loja.</p></div><button onClick={logout} className="admin-secondary">Sair</button></header>
    <nav aria-label="Seções administrativas" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{sections.map(section => <button key={section} type="button" onClick={() => openSection(section)} className={active === section ? "admin-nav active" : "admin-nav"}>{section}<span>›</span></button>)}</nav>
    <section className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-white/[.04] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.25em] text-fuchsia-300">Área aberta</p><h2 className="mt-2 text-2xl font-black">{active}</h2>
      {active === "Produtos" ? <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(320px,1.2fr)]"><form onSubmit={saveItem} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">{editingId ? "Editar produto" : "Cadastrar produto"}</h3><input required className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" /><input required className="admin-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Preço" /><input className="admin-input" value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="Link da imagem ou vídeo" /><textarea className="admin-input min-h-28" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição" /><div className="flex flex-wrap gap-3"><button className="admin-primary" disabled={saving}>{saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar produto"}</button>{editingId && <button className="admin-secondary" type="button" onClick={clearForm}>Cancelar</button>}</div></form><div><h3 className="font-bold">Produtos cadastrados</h3>{loading ? <p className="mt-4 text-sm text-white/60">Carregando...</p> : items.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-white/20 p-5 text-sm text-white/60">Nenhum produto cadastrado.</p> : <div className="mt-3 grid gap-3">{items.map(item => <article key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-4"><div><strong>{item.name}</strong><p className="text-sm text-fuchsia-200">R$ {Number(item.price).toFixed(2).replace(".", ",")}</p></div><button className="admin-secondary" type="button" onClick={() => editItem(item)}>Editar</button></article>)}</div>}</div></div> : <div className="mt-6 rounded-xl border border-dashed border-white/20 p-6"><h3 className="font-bold">Configurar {active.toLowerCase()}</h3><p className="mt-2 text-sm text-white/60">Os controles desta área estão prontos para você configurar. Selecione outra seção ou volte para Produtos.</p><button type="button" className="admin-primary mt-5" onClick={() => openSection("Produtos")}>Voltar para produtos</button></div>}
      {message && <p role="status" className="mt-4 text-sm text-fuchsia-200">{message}</p>}
    </section>
  </div></main>
}
