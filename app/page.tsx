'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react'

const whatsapp = '5531982941291'
type Product = { id: string; name: string; price: number; description: string; media_url: string | null; category_id: string | null }

const fallbackImage = '/lupita-character.jpg'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [cart, setCart] = useState<Product[]>([])
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  useEffect(() => {
    fetch('/api/catalog', { cache: 'no-store' }).then((response) => response.ok ? response.json() : []).then(setProducts).catch(() => setProducts([]))
  }, [])
  const filtered = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
  const subtotal = cart.reduce((total, item) => total + item.price, 0)
  const total = Math.max(0, subtotal - discount)
  const addToCart = (product: (typeof products)[number]) => { setCart((items) => [...items, product]); setSelected(null) }
  const applyCoupon = () => { if (coupon.trim().toUpperCase() === 'LUPITA10') setDiscount(subtotal * 0.1); else setDiscount(0) }
  const checkoutMessage = cart.length ? `Olá! Quero finalizar meu pedido: ${cart.map((item) => item.name).join(', ')}. Total: R$ ${total.toFixed(2).replace('.', ',')}. Cupom: ${coupon || 'nenhum'}.` : 'Olá! Vim pelo catálogo da LUPITA SHOPEE.'
  const openWhatsApp = (message = checkoutMessage) => window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank')

  return <main className="lupita-site"><div className="noise" /><header className="topbar"><Link href="/" className="brand-lockup"><span className="brand-mark">L</span><span>LUPITA <b>SHOPEE</b></span></Link><nav className={menuOpen ? 'nav open' : 'nav'}><a href="#catalogo" onClick={() => setMenuOpen(false)}>CATÁLOGO</a><a href="#ofertas" onClick={() => setMenuOpen(false)}>OFERTAS</a><Link href="/admin">PAINEL ADM</Link></nav><button className="menu-button" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></header><section className="hero-grid"><div className="hero-copy"><div className="eyebrow">EXPERIÊNCIA DIGITAL PREMIUM</div><h1>SEU UNIVERSO.<br /><em>SEU JOGO.</em><br />SUA LUPITA.</h1><p className="hero-lede">Itens digitais, recargas e benefícios para você jogar no próximo nível. Escolha, adicione ao carrinho e finalize quando estiver pronto.</p><div className="hero-actions"><a className="primary-cta" href="#catalogo">VER CATÁLOGO <ArrowRight /></a><button className="ghost-cta" onClick={() => openWhatsApp('Olá! Preciso de ajuda com um produto.')}>FALAR AGORA</button></div></div><div className="hero-art"><div className="portrait-frame"><Image src="/lupita-character.jpg" alt="Personagem futurista da LUPITA SHOPEE" fill priority sizes="(max-width: 700px) 92vw, 600px" /></div></div></section><section className="catalog-section" id="catalogo"><div className="section-heading"><div><span className="eyebrow">CENTRAL DE COMANDO</span><h2>ESCOLHA SUA <em>PRÓXIMA FASE</em></h2></div><div className="search-box"><Search /><input placeholder="Buscar no catálogo" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div><div className="product-grid">{filtered.map((product) => <button key={product.id} className="product-card" onClick={() => setSelected(product)}><div className="product-image"><Image src={(product.media_url || fallbackImage)} alt={product.name} fill sizes="300px" /></div><div><span className="eyebrow">DIGITAL</span><h3>{product.name}</h3><p>{product.description}</p><strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong></div></button>)}</div></section>{cart.length > 0 && <aside className="cart-panel" aria-label="Seu carrinho"><div><span className="eyebrow"><ShoppingBag /> SEU CARRINHO</span><p>{cart.length} item(ns) · R$ {subtotal.toFixed(2).replace('.', ',')}</p>{discount > 0 && <small>Desconto aplicado: R$ {discount.toFixed(2).replace('.', ',')}</small>}</div><div className="coupon-row"><input aria-label="Cupom de desconto" placeholder="Digite seu cupom" value={coupon} onChange={(e) => setCoupon(e.target.value)} /><button onClick={applyCoupon}>APLICAR</button></div><button className="primary-cta" onClick={() => openWhatsApp()}>CHECKOUT R$ {total.toFixed(2).replace('.', ',')} <MessageCircle /></button></aside>}{selected && <div className="product-modal" role="dialog" aria-modal="true"><div className="modal-card"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><X /></button>{selected.media_url && <Image src={selected.media_url} alt={selected.name} width={180} height={180} unoptimized />}<span className="eyebrow">DIGITAL</span><h2>{selected.name}</h2><p>{selected.description}</p><strong>R$ {selected.price.toFixed(2).replace('.', ',')}</strong><button className="primary-cta" onClick={() => addToCart(selected)}>ADICIONAR AO CARRINHO <ShoppingBag /></button></div></div>}</main>
}
