'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import PaymentSettings, { defaultPaymentConfig } from '@/components/admin/payment-settings'

type Item = { id: string; name: string; price: number; media_url: string | null; description: string; category?: string; category_id?: string | null; subcategory?: string | null }
type Category = { id: string; name: string; subcategories: string[] }
type Coupon = { id: string; code: string; discount_type: 'percent' | 'fixed'; value: number; category: string; product_id: string | null; active: boolean }
type Rule = { id: string; percent: number; category: string; product_id: string | null; active: boolean }
type Announcement = { id: string; title: string; body: string; kind: string; active: boolean }
type Settings = { store_name: string; whatsapp: string; logo_url: string; hero_title: string; hero_text: string; hero_media_url: string; hero_media_type: 'image' | 'video' }
type Payments = typeof defaultPaymentConfig

const sections = ['Produtos', 'Categorias', 'Promoções e cupons', 'Cashback', 'Novidades', 'Pagamentos', 'Aparência e textos']
const emptyItem = { name: '', price: '', media_url: '', description: '', category: '' }
const emptySettings: Settings = { store_name: '', whatsapp: '', logo_url: '', hero_title: '', hero_text: '', hero_media_url: '', hero_media_type: 'image' }
const emptyPayments: Payments = defaultPaymentConfig

export default function AdminDashboard({ name }: { name: string }) {
  const [active, setActive] = useState('Produtos')
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [settings, setSettings] = useState(emptySettings)
  const [payments, setPayments] = useState(emptyPayments)
  const [form, setForm] = useState(emptyItem)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [coupon, setCoupon] = useState({ code: '', discount_type: 'percent', value: '', category: 'Todas', product_id: '' })
  const [rule, setRule] = useState({ percent: '', category: 'Todas', product_id: '' })
  const [category, setCategory] = useState({ name: '', subcategories: '' })
  const [announcement, setAnnouncement] = useState({ title: '', body: '', kind: 'novidade', image_url: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const api = async (path: string, options?: RequestInit) => {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir')
    return data
  }
  const readMedia = (file: File, maxMb = 8) => new Promise<{ url: string; type: 'image' | 'video' }>((resolve, reject) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return reject(new Error('Escolha uma foto ou vídeo válido.'))
    if (file.size > maxMb * 1024 * 1024) return reject(new Error(`O arquivo deve ter no máximo ${maxMb} MB.`))
    const reader = new FileReader()
    reader.onload = () => resolve({ url: String(reader.result), type: file.type.startsWith('video/') ? 'video' : 'image' })
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.readAsDataURL(file)
  })
  const chooseMedia = async (file: File | undefined, onChange: (value: { url: string; type: 'image' | 'video' }) => void) => {
    if (!file) return
    try { onChange(await readMedia(file)) } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro no upload') }
  }

  async function load() {
    setLoading(true)
    try {
      const [products, cats, couponsData, rulesData, news, storeSettings, paymentSettings] = await Promise.all([
        api('/api/admin/items'), api('/api/admin/store-config?table=store_categories'), api('/api/admin/store-config?table=store_coupons'),
        api('/api/admin/store-config?table=store_cashback_rules'), api('/api/admin/store-config?table=store_announcements'),
        api('/api/admin/store-config?table=store_settings'), api('/api/admin/store-config?table=store_payment_settings'),
      ])
      setItems(products); setCategories(cats); setCoupons(couponsData); setRules(rulesData); setAnnouncements(news)
      if (storeSettings[0]) setSettings({ ...emptySettings, ...storeSettings[0] })
      if (paymentSettings[0]) setPayments({ ...emptyPayments, ...paymentSettings[0] })
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao carregar o painel') } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])
  async function saveItem(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/items', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, category_id: form.category || null, id: editingId }) }); setMessage('Produto salvo.'); setForm(emptyItem); setEditingId(null); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar produto') } }
  async function saveCategory(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_categories', name: category.name.trim(), subcategories: category.subcategories.split(',').map((value) => value.trim()).filter(Boolean) }) }); setCategory({ name: '', subcategories: '' }); setMessage('Categoria salva.'); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar categoria') } }
  async function saveCoupon(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_coupons', code: coupon.code.trim().toUpperCase(), discount_type: coupon.discount_type, value: Number(coupon.value), category: coupon.category, product_id: coupon.product_id || null }) }); setCoupon({ code: '', discount_type: 'percent', value: '', category: 'Todas', product_id: '' }); setMessage('Cupom automático salvo.'); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar cupom') } }
  async function saveRule(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_cashback_rules', percent: Number(rule.percent), category: rule.category, product_id: rule.product_id || null }) }); setRule({ percent: '', category: 'Todas', product_id: '' }); setMessage('Cashback automático salvo.'); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar cashback') } }
  async function saveAnnouncement(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_announcements', ...announcement }) }); setAnnouncement({ title: '', body: '', kind: 'novidade', image_url: '' }); setMessage('Publicação salva.'); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar publicação') } }
  async function saveSettings(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_settings', id: true, ...settings }) }); setMessage('Textos, WhatsApp e foto salvos.'); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar aparência') } }
  async function savePayments(event: React.FormEvent) { event.preventDefault(); try { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_payment_settings', id: true, ...payments }) }); setMessage('Formas de pagamento e juros salvos.'); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar pagamentos') } }
  async function logout() { await authClient.signOut(); window.location.href = '/admin/login' }

  const field = (value: string | number, onChange: (value: string) => void, placeholder: string, type = 'text') => <input className="admin-input" required placeholder={placeholder} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
  const productSelect = (value: string, onChange: (value: string) => void) => <select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">Todos os produtos</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
  const categorySelect = () => {
    const filtered = categories.filter((item) => item.name.toLocaleLowerCase().includes(categoryQuery.toLocaleLowerCase()))
    const selected = categories.find((item) => item.id === form.category)
    return <div className="grid gap-2"><label className="text-sm text-white/70" htmlFor="product-category">Categoria</label>{categories.length > 0 && <input className="admin-input" aria-label="Pesquisar categoria" placeholder="Pesquisar categoria" value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} />}<select id="product-category" className="admin-input" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">{categories.length ? 'Selecione uma categoria' : 'Nenhuma categoria cadastrada'}</option>{filtered.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{selected && selected.subcategories.length > 0 && <select className="admin-input" aria-label="Subcategoria" onChange={(event) => setForm({ ...form, subcategory: event.target.value } as typeof form)}><option value="">Sem subcategoria</option>{selected.subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</select>}{categories.length === 0 && <button type="button" className="text-left text-sm text-fuchsia-300 underline" onClick={() => setActive('Categorias')}>Cadastrar nova categoria</button>}</div>
  }
  const FormShell = ({ children, title }: { children: React.ReactNode; title: string }) => <form onSubmit={(event) => event.preventDefault()} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">{title}</h3>{children}</form>

  return <main className="min-h-screen bg-[#07050b] p-4 text-white sm:p-8"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">LUPITA SHOPEE</p><h1 className="mt-2 text-3xl font-black">Painel administrativo</h1><p className="mt-2 text-sm text-white/60">Olá, {name}. Todas as alterações são salvas no Supabase.</p></div><button onClick={logout} className="admin-secondary">Sair</button></header><nav aria-label="Seções administrativas" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{sections.map((section) => <button key={section} type="button" onClick={() => { setActive(section); setMessage('') }} className={active === section ? 'admin-nav active' : 'admin-nav'}>{section}<span>›</span></button>)}</nav><section className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-white/[.04] p-5 sm:p-7"><h2 className="text-2xl font-black">{active}</h2>{loading && <p className="mt-4 text-sm text-white/60">Carregando dados...</p>}
  {active === 'Produtos' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveItem} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">{editingId ? 'Editar produto' : 'Adicionar produto'}</h3>{field(form.name, (value) => setForm({ ...form, name: value }), 'Nome do produto')}{field(form.price, (value) => setForm({ ...form, price: value }), 'Preço', 'number')}<label className="grid gap-2 text-sm text-white/70">Foto ou vídeo do produto<input className="admin-input" type="file" accept="image/*,video/*" onChange={(event) => void chooseMedia(event.target.files?.[0], ({ url }) => setForm({ ...form, media_url: url }))} /><span className="text-xs text-white/40">Até 8 MB. O arquivo é salvo junto com o produto, sem URL externa.</span></label>{form.media_url && <p className="text-xs text-fuchsia-200">Mídia selecionada e pronta para salvar.</p>}{categorySelect()}<textarea className="admin-input min-h-24" placeholder="Descrição" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><button className="admin-primary">Salvar produto</button></form><div className="grid gap-3">{items.map((item) => <article className="flex items-center justify-between rounded-xl border border-white/10 p-4" key={item.id}><div><strong>{item.name}</strong><p className="text-fuchsia-200">R$ {Number(item.price).toFixed(2).replace('.', ',')}</p></div><button className="admin-secondary" onClick={() => { setEditingId(item.id); setForm({ name: item.name, price: String(item.price), media_url: item.media_url || '', description: item.description, category: item.category_id || '' }); setCategoryQuery('') }}>Editar</button></article>)}</div></div>}
  {active === 'Categorias' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveCategory} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Criar categoria e subcategorias</h3>{field(category.name, (value) => setCategory({ ...category, name: value }), 'Nome da categoria')}<textarea className="admin-input min-h-24" placeholder="Subcategorias separadas por vírgula" value={category.subcategories} onChange={(event) => setCategory({ ...category, subcategories: event.target.value })} /><button className="admin-primary">Salvar categoria</button></form><div className="grid gap-3">{categories.map((item) => <article className="rounded-xl border border-white/10 p-4" key={item.id}><strong>{item.name}</strong><p className="text-sm text-white/60">{item.subcategories.join(' · ') || 'Sem subcategorias'}</p></article>)}</div></div>}
  {active === 'Promoções e cupons' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveCoupon} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Criar cupom automático</h3>{field(coupon.code, (value) => setCoupon({ ...coupon, code: value }), 'Código')}{field(coupon.value, (value) => setCoupon({ ...coupon, value }), 'Desconto', 'number')}<select className="admin-input" value={coupon.discount_type} onChange={(event) => setCoupon({ ...coupon, discount_type: event.target.value })}><option value="percent">Percentual (%)</option><option value="fixed">Valor fixo (R$)</option></select>{field(coupon.category, (value) => setCoupon({ ...coupon, category: value }), 'Categoria ou Todas')}{productSelect(coupon.product_id, (value) => setCoupon({ ...coupon, product_id: value }))}<button className="admin-primary">Salvar cupom</button></form><div className="grid gap-3">{coupons.map((item) => <article key={item.id} className="rounded-xl border border-white/10 p-4"><strong>{item.code}</strong><p className="text-sm text-white/60">{item.discount_type === 'percent' ? `${item.value}%` : `R$ ${item.value}`} · {item.category}</p></article>)}</div></div>}
  {active === 'Cashback' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveRule} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Cashback automático</h3>{field(rule.percent, (value) => setRule({ ...rule, percent: value }), 'Percentual', 'number')}{field(rule.category, (value) => setRule({ ...rule, category: value }), 'Categoria ou Todas')}{productSelect(rule.product_id, (value) => setRule({ ...rule, product_id: value }))}<button className="admin-primary">Salvar regra</button></form><div className="grid gap-3">{rules.map((item) => <article key={item.id} className="rounded-xl border border-white/10 p-4">{item.percent}% de cashback · {item.category}</article>)}</div></div>}
  {active === 'Novidades' && <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveAnnouncement} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold">Publicar promoção ou novidade</h3>{field(announcement.title, (value) => setAnnouncement({ ...announcement, title: value }), 'Título')}<textarea className="admin-input min-h-28" required placeholder="Texto da publicação" value={announcement.body} onChange={(event) => setAnnouncement({ ...announcement, body: event.target.value })} />{field(announcement.image_url, (value) => setAnnouncement({ ...announcement, image_url: value }), 'Link da imagem')}<select className="admin-input" value={announcement.kind} onChange={(event) => setAnnouncement({ ...announcement, kind: event.target.value })}><option value="novidade">Novidade</option><option value="promocao">Promoção</option></select><button className="admin-primary">Publicar</button></form><div className="grid gap-3">{announcements.map((item) => <article key={item.id} className="rounded-xl border border-white/10 p-4"><strong>{item.title}</strong><p className="text-sm text-white/60">{item.body}</p></article>)}</div></div>}
  {active === 'Pagamentos' && <PaymentSettings initial={payments} categories={categories} onSave={async (config) => { await api('/api/admin/store-config', { method: 'POST', body: JSON.stringify({ table: 'store_payment_settings', id: true, ...config }) }); setPayments(config); await load() }} onMessage={setMessage} />}
  {active === 'Aparência e textos' && <form onSubmit={saveSettings} className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-5"><p className="text-sm text-white/60">Esses campos controlam os textos e a mídia exibidos na tela principal da loja.</p>{field(settings.store_name, (value) => setSettings({ ...settings, store_name: value }), 'Nome da loja')}{field(settings.whatsapp, (value) => setSettings({ ...settings, whatsapp: value }), 'WhatsApp')}<label className="grid gap-2 text-sm text-white/70">Logo ou imagem principal<input className="admin-input" type="file" accept="image/*,video/*" onChange={(event) => void chooseMedia(event.target.files?.[0], ({ url, type }) => setSettings({ ...settings, hero_media_url: url, hero_media_type: type, logo_url: type === 'image' ? url : settings.logo_url }))} /></label>{settings.hero_media_url && <p className="text-xs text-fuchsia-200">Mídia selecionada e pronta para salvar.</p>}{field(settings.hero_title, (value) => setSettings({ ...settings, hero_title: value }), 'Título principal')}<textarea className="admin-input min-h-28" placeholder="Texto principal da loja" value={settings.hero_text} onChange={(event) => setSettings({ ...settings, hero_text: event.target.value })} /><button className="admin-primary">Salvar aparência e textos</button></form>}
  {message && <p role="status" aria-live="polite" className={`mt-4 rounded-lg border p-3 text-sm ${message.includes('Erro') || message.includes('Não') ? 'border-red-400/30 text-red-200' : 'border-fuchsia-400/20 text-fuchsia-200'}`}>{message}</p>}</section></div></main>
}
