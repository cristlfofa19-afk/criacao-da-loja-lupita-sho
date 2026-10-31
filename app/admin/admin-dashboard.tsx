"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

type Item = { id: string; name: string; price: number; media_url: string | null; description: string }
type Form = { name: string; price: string; media_url: string; description: string }
const emptyForm: Form = { name: "", price: "", media_url: "", description: "" }

export default function AdminDashboard({ name }: { name: string }) {
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
    } catch {
      setMessage("Não foi possível carregar os itens. Tente atualizar a página.")
    } finally { setLoading(false) }
  }

  useEffect(() => { void loadItems() }, [])

  function editItem(item: Item) {
    setEditingId(item.id)
    setForm({ name: item.name, price: String(item.price), media_url: item.media_url ?? "", description: item.description })
    setMessage("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function cancelEdit() { setEditingId(null); setForm(emptyForm); setMessage("") }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("")
    try {
      const response = await fetch("/api/admin/items", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editingId }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar.")
      setMessage(editingId ? "Item atualizado." : "Item cadastrado.")
      cancelEdit(); await loadItems()
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar.") }
    finally { setSaving(false) }
  }

  async function logout() { await authClient.signOut(); window.location.href = "/admin/login" }

  return <main className="min-h-screen bg-[#07050b] p-4 text-white sm:p-8"><div className="mx-auto max-w-5xl">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-3xl font-black">Administrar itens</h1><p className="mt-2 text-sm text-white/60">Olá, {name}. Cadastre e edite os itens diretamente aqui.</p></div><button onClick={logout} className="rounded-lg border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70">Sair</button></header>
    <section className="mt-6 rounded-2xl border border-fuchsia-400/30 bg-white/[.04] p-5 sm:p-7"><h2 className="text-xl font-bold">{editingId ? "Editar item" : "Cadastrar novo item"}</h2><form onSubmit={saveItem} className="mt-5 grid gap-4"><input className="admin-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do item" /><div className="grid gap-4 sm:grid-cols-2"><input className="admin-input" required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Preço" /><input className="admin-input" value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="Link da imagem ou vídeo (opcional)" /></div><textarea className="admin-input min-h-28 resize-y" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição do item" /><div className="flex flex-wrap gap-3"><button className="admin-primary" type="submit" disabled={saving}>{saving ? "Salvando..." : editingId ? "Salvar edição" : "Cadastrar item"}</button>{editingId && <button className="admin-secondary" type="button" onClick={cancelEdit}>Cancelar</button>}</div></form>{message && <p className="mt-4 text-sm text-fuchsia-200">{message}</p>}</section>
    <section className="mt-6"><h2 className="text-xl font-bold">Itens cadastrados</h2>{loading ? <p className="mt-4 text-sm text-white/60">Carregando...</p> : items.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-white/20 p-6 text-sm text-white/60">Nenhum item cadastrado ainda. Use o formulário acima.</p> : <div className="mt-4 grid gap-3">{items.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[.04] p-4"><div><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-sm text-fuchsia-200">R$ {Number(item.price).toFixed(2).replace(".", ",")}</p></div><button className="admin-secondary" type="button" onClick={() => editItem(item)}>Editar</button></article>)}</div>}</section>
  </div></main>
}
