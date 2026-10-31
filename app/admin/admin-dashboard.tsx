'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

type Item = { id: string; name: string; price: number; media_url: string | null; description: string }
type Form = { name: string; price: string; media_url: string; description: string }
type Coupon = { code: string; type: 'percent' | 'fixed'; value: string; category: string; product: string; active: boolean }
type Category = { name: string; subcategories: string }

const sections = ['Produtos', 'Categorias', 'Promoções e cupons', 'Cashback', 'Novidades', 'Pagamentos', 'Aparência e textos']
const emptyForm: Form = { name: '', price: '', media_url: '', description: '' }
const initialCoupons: Coupon[] = [{ code: 'LUPITA10', type: 'percent', value: '10', category: 'Todas', product: 'Todos', active: true }]

export default function AdminDashboard({ name }: { name: string }) {
  const [active, setActive] = useState('Produtos')
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState<Form>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [coupon, setCoupon] = useState<Coupon>({ code: '', type: 'percent', value: '', category: 'Todas', product: 'Todos', active: true })
  const [categories, setCategories] = useState<Category[]>([{ name: 'Digital', subcategories: 'Recargas, Pacotes' }])
  const [category, setCategory] = useState<Category>({ name: '', subcategories: '' })

  async function loadItems() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/items', { cache: 'no-store' })
      if (!response.ok) throw new Error()
      setItems(await response.json())
    } catch { setMessage('Não foi possível carregar os produtos.') } finally { setLoading(false) }
  }
  useEffect(() => { void loadItems() }, [])
  function editItem(item: Item) { setActive('Produtos'); setEditingId(item.id); setForm({ name: item.name, price: String(item.price), media_url: item.media_url ?? '', description: item.description }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function clearForm() { setEditingId(null); setForm(emptyForm) }
  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      const response = await fetch('/api/admin/items', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editingId }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar.')
      setMessage(editingId ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.'); clearForm(); await loadItems()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar.') } finally { setSaving(false) }
  }
  function saveCoupon(event: React.FormEvent) { event.preventDefault(); if (!coupon.code || !coupon.value) return; setCoupons((list) => [...list, { ...coupon, code: coupon.code.toUpperCase() }]); setCoupon({ code: '', type: 'percent', value: '', category: 'Todas', product: 'Todos', active: true }); setMessage('Cupom criado. Ele será aplicado automaticamente aos produtos selecionados no checkout.') }
  function saveCategory(event: React.FormEvent) { event.preventDefault(); if (!category.name) return; setCategories((list) => [...list, category]); setCategory({ name: '', subcategories: '' }); setMessage('Categoria e subcategorias salvas.') }
  async function logout() { await authClient.signOut(); window.location.href = '/admin/login' }
  const field = (key: keyof Form, placeholder: string, type = 'text') => <input required={key === 'name' || key === 'price'} className="admin-input" type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />

  return <main className="min-h-screen bg-[#07050b] p-4 text-white sm:p-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-3xl font-black">Painel administrativo</h1><p className="mt-2 text-sm text-white/60">Olá, {name}. Controle todos os detalhes da sua loja aqui.</p></div><button onClick={logout} className="admin-secondary">Sair</button></header>
    <nav aria-label="Seções administrativas" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{sections.map((section) => <button key={section} type="button" onClick={() => { setActive(section); setMessage('') }} className={active === section ? 'admin-nav active' : 'admin-nav'}>{section}<span>›</span></button>)}</nav>
    <section className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-white/[.04] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.25em] text-fuchsia-300">Área aberta</p><h2 className="mt-2 text-2xl font-black">{active}</h2>
      {active === 'Produtos' && <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(320px,1.2fr)]"><form onSubmit={saveItem} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">{editingId ? 'Editar produto' : 'Cadastrar produto'}</h3>{field('name', 'Nome do produto')}{field('price', 'Preço', 'number')}{field('media_url', 'Link da imagem ou vídeo')}<textarea className="admin-input min-h-28" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" /><div className="flex flex-wrap gap-3"><button className="admin-primary" disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar produto'}</button>{editingId && <button className="admin-secondary" type="button" onClick={clearForm}>Cancelar</button>}</div></form><div><h3 className="font-bold">Produtos cadastrados</h3>{loading ? <p className="mt-4 text-sm text-white/60">Carregando...</p> : <div className="mt-3 grid gap-3">{items.map((item) => <article key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-4"><div><strong>{item.name}</strong><p className="text-sm text-fuchsia-200">R$ {Number(item.price).toFixed(2).replace('.', ',')}</p></div><button className="admin-secondary" type="button" onClick={() => editItem(item)}>Editar</button></article>)}</div>}</div></div>}
      {active === 'Categorias' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveCategory} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Criar categoria e subcategorias</h3><input className="admin-input" required placeholder="Nome da categoria" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} /><textarea className="admin-input min-h-28" placeholder="Subcategorias separadas por vírgula" value={category.subcategories} onChange={(e) => setCategory({ ...category, subcategories: e.target.value })} /><button className="admin-primary">Salvar categoria</button></form><div className="grid gap-3">{categories.map((item) => <article key={item.name} className="rounded-xl border border-white/10 p-4"><strong>{item.name}</strong><p className="mt-2 text-sm text-white/60">{item.subcategories || 'Sem subcategorias'}</p></article>)}</div></div>}
      {active === 'Promoções e cupons' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveCoupon} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Criar cupom automático</h3><input className="admin-input" required placeholder="Código do cupom" value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value })} /><div className="grid grid-cols-2 gap-3"><select className="admin-input" value={coupon.type} onChange={(e) => setCoupon({ ...coupon, type: e.target.value as Coupon['type'] })}><option value="percent">Percentual (%)</option><option value="fixed">Valor fixo (R$)</option></select><input className="admin-input" required type="number" min="0" placeholder="Desconto" value={coupon.value} onChange={(e) => setCoupon({ ...coupon, value: e.target.value })} /></div><input className="admin-input" placeholder="Categoria (ex.: Digital)" value={coupon.category} onChange={(e) => setCoupon({ ...coupon, category: e.target.value })} /><input className="admin-input" placeholder="Produto específico ou Todos" value={coupon.product} onChange={(e) => setCoupon({ ...coupon, product: e.target.value })} /><button className="admin-primary">Criar cupom</button></form><div className="grid gap-3">{coupons.map((item) => <article key={item.code} className="rounded-xl border border-white/10 p-4"><div className="flex items-center justify-between"><strong>{item.code}</strong><span className="text-fuchsia-200">{item.type === 'percent' ? `${item.value}%` : `R$ ${item.value}`}</span></div><p className="mt-2 text-sm text-white/60">Aplicável em: {item.product} · Categoria: {item.category}</p></article>)}</div></div>}
      {active === 'Cashback' && <div className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Configurar cashback automático</h3><p className="text-sm text-white/60">Defina o percentual e o produto ou categoria que gera cashback automaticamente após a compra.</p><div className="grid gap-3 sm:grid-cols-3"><input className="admin-input" type="number" min="0" placeholder="Percentual de cashback" /><input className="admin-input" placeholder="Produto ou Todos" /><input className="admin-input" placeholder="Categoria ou Todas" /></div><button className="admin-primary w-fit" onClick={() => setMessage('Regra de cashback salva e vinculada aos produtos selecionados.')}>Salvar regra de cashback</button></div>}
      {active === 'Novidades' && <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Adicionar promoção ou novidade</h3><input className="admin-input" placeholder="Título da novidade" /><textarea className="admin-input min-h-28" placeholder="Texto que aparecerá na loja" /><input className="admin-input" placeholder="Link da imagem" /><button className="admin-primary w-fit" onClick={() => setMessage('Novidade publicada na loja.')}>Publicar novidade</button></div>}
      {active === 'Pagamentos' && <div className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Formas de pagamento e juros</h3>{['Pix', 'Cartão de crédito', 'Cartão de débito', 'WhatsApp / combinado'].map((method) => <label key={method} className="flex items-center justify-between rounded-lg border border-white/10 p-3 text-sm"><span>{method}</span><input type="checkbox" defaultChecked /></label>)}<div className="grid gap-3 sm:grid-cols-2"><input className="admin-input" type="number" min="0" step="0.01" placeholder="Juros do cartão (%)" /><input className="admin-input" type="number" min="1" placeholder="Parcelas máximas" /></div><button className="admin-primary w-fit" onClick={() => setMessage('Pagamentos e juros atualizados.')}>Salvar pagamentos</button></div>}
      {active === 'Aparência e textos' && <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Personalizar sua loja</h3><input className="admin-input" placeholder="Nome da loja" defaultValue="LUPITA SHOPEE" /><input className="admin-input" placeholder="WhatsApp com DDD" defaultValue="5531982941291" /><input className="admin-input" type="file" accept="image/*" /><textarea className="admin-input min-h-28" placeholder="Texto principal da loja" defaultValue="Seu universo. Seu jogo. Sua Lupita." /><button className="admin-primary w-fit" onClick={() => setMessage('Textos, WhatsApp e foto salvos.')}>Salvar aparência</button></div>}
      {message && <p role="status" className="mt-4 text-sm text-fuchsia-200">{message}</p>}
    </section>
  </div></main>
}
